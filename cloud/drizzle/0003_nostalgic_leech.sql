CREATE TABLE `account_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`verified_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `account_tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`expires` integer NOT NULL,
	`used_at` text,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "account_token_purpose" CHECK("account_tokens"."purpose" IN ('verify','reset'))
);
--> statement-breakpoint
CREATE INDEX `account_tokens_user` ON `account_tokens` (`user_id`,`purpose`);--> statement-breakpoint
CREATE TABLE `workspace_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`workspace` text NOT NULL,
	`email` text NOT NULL,
	`permission` text NOT NULL,
	`invited_by` text,
	`expires` integer NOT NULL,
	`used_at` text,
	`created` text NOT NULL,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "invite_permission" CHECK("workspace_invites"."permission" IN ('viewer','editor'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_invites_token_unique` ON `workspace_invites` (`token`);--> statement-breakpoint
CREATE INDEX `workspace_invites_workspace` ON `workspace_invites` (`workspace`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`user_id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`permission` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "member_permission" CHECK("workspace_members"."permission" IN ('viewer','editor'))
);
--> statement-breakpoint
CREATE INDEX `workspace_members_workspace` ON `workspace_members` (`workspace`);