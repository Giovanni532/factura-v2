CREATE TABLE `company_default_template` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`template_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `template`(`id`) ON UPDATE no action ON DELETE cascade
);
