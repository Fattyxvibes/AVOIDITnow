CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int,
	`name` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`barcode` varchar(64),
	`category` varchar(80) NOT NULL,
	`status` enum('boycotted','caution','alternative') NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `proofLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int,
	`productId` int,
	`title` varchar(200) NOT NULL,
	`publisher` varchar(160),
	`url` varchar(512) NOT NULL,
	`sourceType` enum('primary','reporting','research','statement') NOT NULL DEFAULT 'reporting',
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proofLinks_id` PRIMARY KEY(`id`)
);
