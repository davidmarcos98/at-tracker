CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"map_id" integer,
	"player_id" integer,
	"time" integer NOT NULL,
	"date" timestamp NOT NULL,
	"is_at" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maps" ADD COLUMN "last_leaderboard_update" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;