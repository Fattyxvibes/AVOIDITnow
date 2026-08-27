CREATE TABLE `productSearchEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`normalizedQuery` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productSearchEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `product_search_events_created_at_idx` ON `productSearchEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `product_search_events_query_created_at_idx` ON `productSearchEvents` (`normalizedQuery`,`createdAt`);