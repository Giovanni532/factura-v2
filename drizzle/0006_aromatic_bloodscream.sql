CREATE TABLE `expense_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`is_active` integer NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`payment_date` integer NOT NULL,
	`method` text NOT NULL,
	`reference` text,
	`description` text NOT NULL,
	`notes` text,
	`invoice_id` text,
	`supplier_id` text,
	`expense_category_id` text,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`expense_category_id`) REFERENCES `expense_category`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_payment`("id", "type", "amount", "payment_date", "method", "reference", "description", "notes", "invoice_id", "supplier_id", "expense_category_id", "company_id", "created_at", "updated_at") SELECT "id", "type", "amount", "payment_date", "method", "reference", "description", "notes", "invoice_id", "supplier_id", "expense_category_id", "company_id", "created_at", "updated_at" FROM `payment`;--> statement-breakpoint
DROP TABLE `payment`;--> statement-breakpoint
ALTER TABLE `__new_payment` RENAME TO `payment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_supplier` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`postal_code` text,
	`country` text NOT NULL,
	`siret` text,
	`vat_number` text,
	`notes` text,
	`is_active` integer NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_supplier`("id", "name", "email", "phone", "address", "city", "postal_code", "country", "siret", "vat_number", "notes", "is_active", "company_id", "created_at", "updated_at") SELECT "id", "name", "email", "phone", "address", "city", "postal_code", "country", "siret", "vat_number", "notes", "is_active", "company_id", "created_at", "updated_at" FROM `supplier`;--> statement-breakpoint
DROP TABLE `supplier`;--> statement-breakpoint
ALTER TABLE `__new_supplier` RENAME TO `supplier`;--> statement-breakpoint
ALTER TABLE `user` ADD `onboarding_progress` text;