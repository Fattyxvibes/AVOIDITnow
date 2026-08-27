CREATE TABLE `news_refresh_state` (
	`id` int NOT NULL,
	`cronTaskUid` varchar(65),
	`lastRefreshedAt` timestamp,
	`lastStatus` varchar(40),
	`lastImportedCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_refresh_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_refresh_state_cronTaskUid_unique` UNIQUE(`cronTaskUid`)
);
--> statement-breakpoint
ALTER TABLE `articles` ADD `externalKey` varchar(80);--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_externalKey_unique` UNIQUE(`externalKey`);