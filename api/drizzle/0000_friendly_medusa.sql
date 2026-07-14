CREATE TYPE "public"."Role" AS ENUM('ADMIN', 'CURATOR', 'LISTENER');--> statement-breakpoint
CREATE TABLE "Album" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"releaseYear" integer,
	"imageUrl" text,
	"artistId" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Artist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Scrobble" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"trackId" integer NOT NULL,
	"playedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Track" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"albumId" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "Role" DEFAULT 'LISTENER' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistId_Artist_id_fk" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Scrobble" ADD CONSTRAINT "Scrobble_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Scrobble" ADD CONSTRAINT "Scrobble_trackId_Track_id_fk" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_Album_id_fk" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Scrobble_userId_playedAt_idx" ON "Scrobble" USING btree ("userId","playedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email");