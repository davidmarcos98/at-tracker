CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"map_uid" varchar(255) NOT NULL,
	"player_id" varchar(255) NOT NULL,
	"time" integer NOT NULL,
	"date" timestamp NOT NULL,
	"is_at" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"name" text NOT NULL,
	"map_id" varchar(255) NOT NULL,
	"map_uid" varchar(255) PRIMARY KEY NOT NULL,
	"tmx_id" varchar(255),
	"author_id" varchar(255) NOT NULL,
	"medal_author" integer NOT NULL,
	"medal_gold" integer NOT NULL,
	"medal_silver" integer NOT NULL,
	"medal_bronze" integer NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"day" integer NOT NULL,
	"is_totd" boolean DEFAULT true NOT NULL,
	"totd_date" timestamp,
	"at_count" integer DEFAULT 0 NOT NULL,
	"laps" integer DEFAULT 1 NOT NULL,
	"thumbnail_url" text,
	"download_url" text,
	"last_leaderboard_update" timestamp DEFAULT now(),
	CONSTRAINT "maps_map_id_unique" UNIQUE("map_id"),
	CONSTRAINT "maps_map_uid_unique" UNIQUE("map_uid"),
	CONSTRAINT "maps_tmx_id_unique" UNIQUE("tmx_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"display_name" varchar(255),
	"account_id" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_map_uid_maps_map_uid_fk" FOREIGN KEY ("map_uid") REFERENCES "public"."maps"("map_uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_player_id_players_account_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("account_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_author_id_players_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."players"("account_id") ON DELETE no action ON UPDATE no action;