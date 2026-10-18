CREATE TABLE `pooling` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`tour_id` text NOT NULL,
	`partner` text NOT NULL,
	`seats` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "pool_seats" CHECK("pooling"."seats">0 AND "pooling"."seats"<=1000),
	CONSTRAINT "pool_price" CHECK("pooling"."unit_price">=0 AND "pooling"."unit_price"<=1000000000),
	CONSTRAINT "pool_paid" CHECK("pooling"."paid">=0 AND "pooling"."paid"<="pooling"."seats"*"pooling"."unit_price"),
	CONSTRAINT "pool_status" CHECK("pooling"."status" IN ('pending','confirmed','cancelled'))
);
--> statement-breakpoint
CREATE INDEX `pooling_workspace` ON `pooling` (`workspace`);--> statement-breakpoint
CREATE INDEX `pooling_tour` ON `pooling` (`tour_id`);
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS pooling_identity_insert BEFORE INSERT ON pooling
BEGIN
  SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM tours WHERE id=NEW.tour_id AND workspace=NEW.workspace) THEN RAISE(ABORT,'POOL_TOUR') END;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS pooling_terms_update BEFORE UPDATE ON pooling
BEGIN
  SELECT CASE WHEN NEW.workspace!=OLD.workspace OR NEW.tour_id!=OLD.tour_id OR NEW.seats!=OLD.seats OR NEW.unit_price!=OLD.unit_price OR NEW.partner!=OLD.partner THEN RAISE(ABORT,'POOL_IMMUTABLE') END;
  SELECT CASE WHEN (OLD.status='cancelled' AND NEW.status!='cancelled') OR (OLD.status='confirmed' AND NEW.status='pending') THEN RAISE(ABORT,'POOL_STATE') END;
  SELECT CASE WHEN NEW.paid>0 AND NEW.status!='confirmed' THEN RAISE(ABORT,'POOL_PAYMENT') END;
  SELECT CASE WHEN NEW.status='confirmed' AND OLD.status='pending' AND NOT EXISTS(SELECT 1 FROM tours WHERE id=NEW.tour_id AND workspace=NEW.workspace AND capacity-reserved>=NEW.seats) THEN RAISE(ABORT,'POOL_NO_SEATS') END;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS pooling_hold AFTER UPDATE OF status ON pooling WHEN OLD.status='pending' AND NEW.status='confirmed'
BEGIN
  UPDATE tours SET reserved=reserved+NEW.seats,version=version+1,updated=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.tour_id AND workspace=NEW.workspace;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS pooling_release AFTER UPDATE OF status ON pooling WHEN OLD.status='confirmed' AND NEW.status='cancelled'
BEGIN
  UPDATE tours SET reserved=reserved-OLD.seats,version=version+1,updated=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=OLD.tour_id AND workspace=OLD.workspace;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS tours_pooling_floor BEFORE UPDATE OF reserved ON tours
WHEN NEW.reserved<COALESCE((SELECT SUM(seats) FROM pooling WHERE tour_id=NEW.id AND status='confirmed'),0)
BEGIN SELECT RAISE(ABORT,'POOL_RESERVED_FLOOR'); END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS tours_pooling_delete BEFORE DELETE ON tours
WHEN EXISTS(SELECT 1 FROM workspaces WHERE id=OLD.workspace) AND EXISTS(SELECT 1 FROM pooling WHERE tour_id=OLD.id AND (status!='cancelled' OR paid>0))
BEGIN SELECT RAISE(ABORT,'POOL_ACTIVE'); END;
