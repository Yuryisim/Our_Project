--
-- PostgreSQL database cluster dump
--

-- Started on 2026-11-13 03:24:20

\restrict qelsSDvoaHzkcDL3udyZ88yy7tgvy4c66DMyWjEPaIUOC5IdQDxHCSSZJBVmhl0

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:DJVA9CixeqM1LfzmVsi2Ag==$2NcCL/Ta4Bfs6NDjm6CszPlMITR0sERrWcBvm1KH9RI=:frRsEJ6rl0iWxweBFYpIzuCjBQUYO5Rn8a3j9mlf2y4=';

--
-- User Configurations
--








\unrestrict qelsSDvoaHzkcDL3udyZ88yy7tgvy4c66DMyWjEPaIUOC5IdQDxHCSSZJBVmhl0

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict jLCZGJEb8DSMMUI80sr7r5TavBERIgQfT2MBsgbKPhQpc818by2tGwUg3gyBbjh

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-13 03:24:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2026-11-13 03:24:20

--
-- PostgreSQL database dump complete
--

\unrestrict jLCZGJEb8DSMMUI80sr7r5TavBERIgQfT2MBsgbKPhQpc818by2tGwUg3gyBbjh

--
-- Database "Markdown files" dump
--

--
-- PostgreSQL database dump
--

\restrict X4HYsYnqS8aU86MexRrdCVdZ5uykXJOLyy4EPGjrMVsbwtmko7OLeWvDcUbzItF

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-13 03:24:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5011 (class 1262 OID 24580)
-- Name: Markdown files; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Markdown files" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Russian_Russia.utf8';


ALTER DATABASE "Markdown files" OWNER TO postgres;

\unrestrict X4HYsYnqS8aU86MexRrdCVdZ5uykXJOLyy4EPGjrMVsbwtmko7OLeWvDcUbzItF
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='Markdown files'"
\restrict X4HYsYnqS8aU86MexRrdCVdZ5uykXJOLyy4EPGjrMVsbwtmko7OLeWvDcUbzItF

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 219 (class 1259 OID 24653)
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    title character varying(255) NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- TOC entry 5005 (class 0 OID 24653)
-- Dependencies: 219
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (title, content, tags) FROM stdin;
Example Title	Example content	{"example tag 1","example tag 2"}
\.


--
-- TOC entry 4857 (class 2606 OID 24663)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (title);


-- Completed on 2026-11-13 03:24:20

--
-- PostgreSQL database dump complete
--

\unrestrict X4HYsYnqS8aU86MexRrdCVdZ5uykXJOLyy4EPGjrMVsbwtmko7OLeWvDcUbzItF

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict oP6Wmm4bVBnfaZzwW4rfml6XuKgWIBQs5Ss2JIo8JIHejbP3vXOj0dOaj8DeNP4

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-13 03:24:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2026-11-13 03:24:20

--
-- PostgreSQL database dump complete
--

\unrestrict oP6Wmm4bVBnfaZzwW4rfml6XuKgWIBQs5Ss2JIo8JIHejbP3vXOj0dOaj8DeNP4

-- Completed on 2026-11-13 03:24:20

--
-- PostgreSQL database cluster dump complete
--

