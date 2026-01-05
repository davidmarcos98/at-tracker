ALTER TABLE "maps" ALTER COLUMN "year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "maps" ALTER COLUMN "month" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "maps" ALTER COLUMN "day" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "display_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "account_id" SET NOT NULL;