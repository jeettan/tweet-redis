CREATE TABLE IF NOT EXISTS "comments"(
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer,
    "post_id" integer,
    "comment" text
);

CREATE TABLE IF NOT EXISTS "likes"(
    "id" serial PRIMARY KEY,
    "user_id" integer,
    "post_id" integer
);

CREATE TABLE IF NOT EXISTS "tweets"(
    "id" integer GENERATED ALWAYS AS IDENTITY(
        sequence name "tweets_id_seq"
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START WITH 1
        CACHE 1
    ),

    "title" varchar NOT NULL,

    "tweet" varchar NOT NULL,

    "date" TIMESTAMP NOT NULL DEFAULT NOW(),

    "user_id" integer NOT NULL,

    "likes" integer DEFAULT 0,

    "shared_post" boolean DEFAULT false,

    CONSTRAINT "tweets_pk" PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "users"(
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY(
        sequence name "users_id_seq"
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START WITH 1
        CACHE 1
    ),
    "first_name" text,
    "last_name" text,
    "username" varchar,
    "password" varchar
);