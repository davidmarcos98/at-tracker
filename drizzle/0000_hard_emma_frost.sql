CREATE TABLE "maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"map_id" varchar(255) NOT NULL,
	"map_uid" varchar(255) NOT NULL,
	"tmx_id" varchar(255) NOT NULL,
	"author" integer,
	"at" integer NOT NULL,
	"gold" integer NOT NULL,
	"silver" integer NOT NULL,
	"bronze" integer NOT NULL,
	"year" integer,
	"month" integer,
	"day" integer,
	"is_totd" boolean DEFAULT true NOT NULL,
	"totd_date" timestamp,
	"at_count" integer DEFAULT 0 NOT NULL,
	"laps" integer DEFAULT 1 NOT NULL,
	"thumbnail_url" text,
	"download_url" text,
	CONSTRAINT "maps_map_id_unique" UNIQUE("map_id"),
	CONSTRAINT "maps_map_uid_unique" UNIQUE("map_uid"),
	CONSTRAINT "maps_tmx_id_unique" UNIQUE("tmx_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"account_id" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_author_players_id_fk" FOREIGN KEY ("author") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;