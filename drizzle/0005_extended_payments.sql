-- Création de la table des fournisseurs
CREATE TABLE `supplier` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`postal_code` text,
	`country` text,
	`siret` text,
	`vat_number` text,
	`category` text,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Modifier la table payment pour supporter les deux types
PRAGMA foreign_keys=OFF;

-- Créer la nouvelle structure de payment
CREATE TABLE `__new_payment` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL DEFAULT 'incoming',
	`amount` real NOT NULL,
	`payment_date` integer NOT NULL,
	`method` text NOT NULL,
	`reference` text,
	`notes` text,
	`description` text,
	`category` text,
	`invoice_id` text,
	`supplier_id` text,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Migrer les données existantes (tous les paiements actuels sont des encaissements)
INSERT INTO `__new_payment`(
	`id`, `type`, `amount`, `payment_date`, `method`, `reference`, `notes`, 
	`invoice_id`, `company_id`, `created_at`
) 
SELECT 
	`id`, 'incoming', `amount`, `payment_date`, `method`, `reference`, `notes`, 
	`invoice_id`, `company_id`, `created_at` 
FROM `payment`;

-- Remplacer l'ancienne table
DROP TABLE `payment`;
ALTER TABLE `__new_payment` RENAME TO `payment`;

PRAGMA foreign_keys=ON; 