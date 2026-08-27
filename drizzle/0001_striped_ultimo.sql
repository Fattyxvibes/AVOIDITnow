CREATE TABLE `adminAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(160) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alternatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`websiteUrl` varchar(512),
	`priceTier` enum('value','mid','premium') NOT NULL DEFAULT 'mid',
	`region` varchar(120),
	`verificationStatus` enum('verified','reviewing','community') NOT NULL DEFAULT 'reviewing',
	`endorsementCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alternatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `answerVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `answerVotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `answer_user_unique` UNIQUE(`answerId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`slug` varchar(260) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`sourceName` varchar(180),
	`sourceUrl` varchar(512),
	`coverImageUrl` varchar(512),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`status` enum('boycotted','caution','alternative') NOT NULL,
	`parentCompany` varchar(160),
	`shortDescription` text NOT NULL,
	`verificationSummary` text NOT NULL,
	`evidenceUrl` varchar(512),
	`evidenceLabel` varchar(180),
	`impactScore` int NOT NULL DEFAULT 0,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`goalAmount` decimal(12,2) NOT NULL,
	`raisedAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`currency` varchar(8) NOT NULL DEFAULT 'USD',
	`urgency` enum('urgent','active','ongoing') NOT NULL DEFAULT 'active',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `communityAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`status` enum('published','hidden') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`category` varchar(80) NOT NULL,
	`status` enum('pending','published','hidden') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'USD',
	`isRecurring` boolean NOT NULL DEFAULT false,
	`status` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
