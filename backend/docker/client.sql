-- Adminer 4.8.1 PostgreSQL 15.3 dump

CREATE TABLE "public"."client" (
    "id" text NOT NULL,
    "username" character varying(255) NOT NULL,
    "password" character(60) NOT NULL,
    "ticket_num" integer DEFAULT '0' NOT NULL,
    CONSTRAINT "client_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "client_username_key" UNIQUE ("username")
) WITH (oids = false);

INSERT INTO "client" ("id", "username", "password", "ticket_num") VALUES
('1',	'aziz',	'$2b$13$tDAPZdNVL9l/G.vtCcw0Z.DWqzk0yU1W7D6mrD5jQUPMIVmqwscyK',	100),
('2',	'murad',	'$2b$13$tx567n9OhDTDAwC7RmDRWuCdaWw2iW8dI3TyZdyx9aTxCrpsFkt56',	0),
('3',	'jirawut',	'$2b$13$r1.RmR2kH5gsv4NQWYIxnukJuSUdv5hdKPq4KBYWx2yHRYSmCa7vK',	50);
