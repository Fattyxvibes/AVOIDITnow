CREATE TABLE `assistantStreamLeases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientKey` varchar(64) NOT NULL,
	`leaseToken` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistantStreamLeases_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_stream_lease_client_unique` UNIQUE(`clientKey`)
);
--> statement-breakpoint
CREATE TABLE `requestRateLimits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` varchar(48) NOT NULL,
	`clientKey` varchar(64) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requestRateLimits_id` PRIMARY KEY(`id`),
	CONSTRAINT `request_rate_limit_scope_client_unique` UNIQUE(`scope`,`clientKey`)
);
--> statement-breakpoint
CREATE INDEX `assistant_stream_lease_expires_at_idx` ON `assistantStreamLeases` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `request_rate_limit_expires_at_idx` ON `requestRateLimits` (`expiresAt`);