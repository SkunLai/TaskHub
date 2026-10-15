CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `events_user` ON `events` (`user_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`user_id` text PRIMARY KEY NOT NULL,
	`portal` integer NOT NULL,
	`operations` integer NOT NULL,
	`sync` integer NOT NULL,
	`ease` integer NOT NULL,
	`intent` text NOT NULL,
	`price` integer NOT NULL,
	`liked` text NOT NULL,
	`disliked` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`tour_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`people` integer NOT NULL,
	`note` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL,
	`consent_version` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`bucket` integer NOT NULL,
	`n` integer NOT NULL,
	PRIMARY KEY(`key`, `bucket`)
);
--> statement-breakpoint
CREATE INDEX `rate_limit_expiry` ON `rate_limits` (`bucket`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_expiry` ON `sessions` (`expires`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`tour_id` text NOT NULL,
	`title` text NOT NULL,
	`assignee` text NOT NULL,
	`due` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`departure` text NOT NULL,
	`duration` text NOT NULL,
	`price` integer NOT NULL,
	`capacity` integer NOT NULL,
	`reserved` integer NOT NULL,
	`description` text NOT NULL,
	`itinerary` text NOT NULL,
	`theme` text NOT NULL,
	`published` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "tour_price" CHECK("tours"."price" >= 0),
	CONSTRAINT "tour_capacity" CHECK("tours"."capacity" > 0),
	CONSTRAINT "tour_reserved" CHECK("tours"."reserved" >= 0 AND "tours"."reserved" <= "tours"."capacity")
);
--> statement-breakpoint
CREATE INDEX `tours_workspace` ON `tours` (`workspace`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`workspace` text NOT NULL,
	`role` text NOT NULL,
	`company_size` text NOT NULL,
	`consent_at` text NOT NULL,
	`consent_version` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_retention` ON `users` (`role`,`consent_at`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
