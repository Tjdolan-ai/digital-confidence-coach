CREATE TABLE `calendar_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`contentType` enum('blog','tweet_thread','linkedin','newsletter','video','other') NOT NULL,
	`plannedDate` timestamp NOT NULL,
	`angle` varchar(500),
	`format` varchar(255),
	`status` enum('idea','in_progress','ready','published') NOT NULL DEFAULT 'idea',
	`contentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`scheduledPostId` int,
	`platform` enum('twitter','linkedin','blog','newsletter') NOT NULL,
	`views` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_derivatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentContentId` int NOT NULL,
	`userId` int NOT NULL,
	`format` enum('tweet_thread','linkedin_post','newsletter','summary','takeaways','promo_post') NOT NULL,
	`content` text NOT NULL,
	`status` enum('draft','scheduled','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_derivatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`contentType` enum('blog','tweet_thread','linkedin','newsletter','youtube_summary','custom') NOT NULL,
	`sourceUrl` varchar(1000),
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`tags` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`derivativeId` int,
	`platform` enum('twitter','linkedin','blog','newsletter') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`publishedAt` timestamp,
	`status` enum('pending','published','failed','cancelled') NOT NULL DEFAULT 'pending',
	`postContent` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('blog','social','newsletter','video_script','general') NOT NULL,
	`structure` text NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trending_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(255) NOT NULL,
	`category` varchar(100),
	`score` int DEFAULT 0,
	`source` varchar(100),
	`metadata` json,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trending_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`niche` varchar(255),
	`keywords` json,
	`twitterHandle` varchar(64),
	`linkedinUrl` varchar(255),
	`blogUrl` varchar(255),
	`timezone` varchar(64) DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
