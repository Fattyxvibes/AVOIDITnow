CREATE TABLE `alternativeRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alternativeId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alternativeRatings_id` PRIMARY KEY(`id`),
	CONSTRAINT `alternative_rating_user_unique` UNIQUE(`alternativeId`,`userId`)
);
