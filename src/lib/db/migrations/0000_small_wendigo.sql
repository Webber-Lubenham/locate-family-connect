CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20),
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
