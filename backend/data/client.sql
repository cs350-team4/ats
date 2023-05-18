--
-- PostgreSQL database dump
--

-- Dumped from database version 12.14 (Ubuntu 12.14-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.14 (Ubuntu 12.14-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: client; Type: TABLE; Schema: public; Owner: ats
--

CREATE TABLE public.client (
    id text NOT NULL,
    username character varying(255) NOT NULL,
    password character(60) NOT NULL,
    ticket_num integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.client OWNER TO ats;

--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: ats
--

COPY public.client (id, username, password, ticket_num) FROM stdin;
1	aziz	$2b$13$tDAPZdNVL9l/G.vtCcw0Z.DWqzk0yU1W7D6mrD5jQUPMIVmqwscyK	100
2	murad	$2b$13$tx567n9OhDTDAwC7RmDRWuCdaWw2iW8dI3TyZdyx9aTxCrpsFkt56	0
3	jirawut	$2b$13$r1.RmR2kH5gsv4NQWYIxnukJuSUdv5hdKPq4KBYWx2yHRYSmCa7vK	50
\.


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: ats
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- Name: client client_username_key; Type: CONSTRAINT; Schema: public; Owner: ats
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

