CREATE TABLE `boycottListingAlternatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`position` int NOT NULL,
	`company` varchar(200) NOT NULL,
	`productService` varchar(500) NOT NULL,
	`sourceUrl` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boycottListingAlternatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boycottListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workbookRow` int NOT NULL,
	`category` varchar(120) NOT NULL,
	`listedBrand` varchar(200) NOT NULL,
	`listedSubproduct` varchar(500) NOT NULL,
	`impactOnSource` varchar(80) NOT NULL,
	`countryShown` varchar(160),
	`notes` text,
	`sourceUrl` varchar(512) NOT NULL,
	`sourceLabel` varchar(220) NOT NULL,
	`sourceReviewedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boycottListings_id` PRIMARY KEY(`id`),
	CONSTRAINT `boycott_listing_workbook_row_unique` UNIQUE(`workbookRow`)
);
