CREATE TABLE `catalogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`catalog` text NOT NULL,
	`campaign` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalogs_catalog_campaign_unique` ON `catalogs` (`catalog`,`campaign`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`catalog_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`color_variant` text NOT NULL,
	`size_variant` text NOT NULL,
	`unit_price` real NOT NULL,
	`page` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);