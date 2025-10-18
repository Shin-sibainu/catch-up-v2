CREATE TABLE `article_tags` (
	`article_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`article_id`, `tag_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_article_tags_article` ON `article_tags` (`article_id`);--> statement-breakpoint
CREATE INDEX `idx_article_tags_tag` ON `article_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_id` text NOT NULL,
	`media_source_id` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`body` text,
	`thumbnail_url` text,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`bookmarks_count` integer DEFAULT 0 NOT NULL,
	`comments_count` integer DEFAULT 0 NOT NULL,
	`views_count` integer DEFAULT 0 NOT NULL,
	`trend_score` integer DEFAULT 0 NOT NULL,
	`author_name` text NOT NULL,
	`author_id` text NOT NULL,
	`author_profile_url` text,
	`author_avatar_url` text,
	`published_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`media_source_id`) REFERENCES `media_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_url_unique` ON `articles` (`url`);--> statement-breakpoint
CREATE INDEX `idx_articles_media_source` ON `articles` (`media_source_id`);--> statement-breakpoint
CREATE INDEX `idx_articles_trend_score` ON `articles` (`trend_score`);--> statement-breakpoint
CREATE INDEX `idx_articles_published_at` ON `articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_articles_external_id` ON `articles` (`external_id`,`media_source_id`);--> statement-breakpoint
CREATE TABLE `crawl_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`media_source_id` integer NOT NULL,
	`status` text NOT NULL,
	`articles_collected` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`media_source_id`) REFERENCES `media_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_crawl_logs_media_source` ON `crawl_logs` (`media_source_id`);--> statement-breakpoint
CREATE INDEX `idx_crawl_logs_status` ON `crawl_logs` (`status`);--> statement-breakpoint
CREATE TABLE `media_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`base_url` text NOT NULL,
	`api_endpoint` text,
	`icon_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_sources_name_unique` ON `media_sources` (`name`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text,
	`icon_url` text,
	`article_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_tags_slug` ON `tags` (`slug`);