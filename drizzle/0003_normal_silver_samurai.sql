CREATE TABLE `userContributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contributionType` enum('question','answer','donation') NOT NULL,
	`entityId` int,
	`label` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userContributions_id` PRIMARY KEY(`id`)
);
