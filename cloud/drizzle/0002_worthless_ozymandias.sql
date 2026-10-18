CREATE TABLE `feature_feedback` (
	`user_id` text PRIMARY KEY NOT NULL,
	`entries` text NOT NULL,
	`price` integer,
	`price_status` text NOT NULL,
	`liked` text NOT NULL,
	`disliked` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "feature_feedback_price" CHECK("feature_feedback"."price" IS NULL OR ("feature_feedback"."price">=0 AND "feature_feedback"."price"<=100000000)),
	CONSTRAINT "feature_feedback_price_status" CHECK("feature_feedback"."price_status" IN ('provided','undecided','not_decider','declined'))
);
--> statement-breakpoint
CREATE TABLE `pooling_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`pooling_id` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`paid_before` integer NOT NULL,
	`paid_after` integer NOT NULL,
	`status_before` text NOT NULL,
	`status_after` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pooling_id`) REFERENCES `pooling`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `pooling_audit_workspace` ON `pooling_audit` (`workspace`);--> statement-breakpoint
CREATE INDEX `pooling_audit_pooling` ON `pooling_audit` (`pooling_id`);--> statement-breakpoint
ALTER TABLE `tasks` ADD `version` integer DEFAULT 1 NOT NULL;