--
-- PostgreSQL database dump
--

\restrict GokY9HRFUYadYQVQDX6RvmggIPrQQGWB5ExMK8PPIPgsizynKkMSwj5mPImJyEm

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-22 05:02:01

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
-- TOC entry 226 (class 1255 OID 24785)
-- Name: delete_unused_tags(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_unused_tags() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM tags
    WHERE tags_id = OLD.tags_id
      AND NOT EXISTS (
          SELECT 1 FROM tags_to_files WHERE tags_id = OLD.tags_id
      );
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_unused_tags() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 24804)
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    user_id integer NOT NULL,
    files_id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    search_vector tsvector GENERATED ALWAYS AS ((setweight(to_tsvector('russian'::regconfig, (COALESCE(title, ''::character varying))::text), 'A'::"char") || setweight(to_tsvector('russian'::regconfig, COALESCE(content, ''::text)), 'B'::"char"))) STORED
);


ALTER TABLE public.files OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24803)
-- Name: files_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_files_id_seq OWNER TO postgres;

--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 224
-- Name: files_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_files_id_seq OWNED BY public.files.files_id;


--
-- TOC entry 222 (class 1259 OID 24729)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    tags_id integer NOT NULL,
    tags_name character varying(255) NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24728)
-- Name: tags_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_tags_id_seq OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 221
-- Name: tags_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_tags_id_seq OWNED BY public.tags.tags_id;


--
-- TOC entry 223 (class 1259 OID 24739)
-- Name: tags_to_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags_to_files (
    files_id integer NOT NULL,
    tags_id integer NOT NULL
);


ALTER TABLE public.tags_to_files OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24679)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(40) NOT NULL,
    password_hash text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24678)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4873 (class 2604 OID 24807)
-- Name: files files_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files ALTER COLUMN files_id SET DEFAULT nextval('public.files_files_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 24732)
-- Name: tags tags_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN tags_id SET DEFAULT nextval('public.tags_tags_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 24682)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5047 (class 0 OID 24804)
-- Dependencies: 225
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (user_id, files_id, title, content, created_at, updated_at) FROM stdin;
1	3	TEST1	Testing database	2026-11-21 20:54:17.833621	2026-11-21 20:54:17.833621
1	4	TEST2	Тестирую датабазу	2026-11-21 21:50:50.216039	2026-11-21 21:50:50.216039
1	5	bebebebe	tetetetete	2026-11-22 04:18:09.215954	2026-11-22 04:18:09.215954
\.


--
-- TOC entry 5044 (class 0 OID 24729)
-- Dependencies: 222
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (tags_id, tags_name) FROM stdin;
8	1
9	savenote
10	database
7	test
12	2
\.


--
-- TOC entry 5045 (class 0 OID 24739)
-- Dependencies: 223
-- Data for Name: tags_to_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags_to_files (files_id, tags_id) FROM stdin;
3	7
3	8
3	9
4	10
4	7
4	12
\.


--
-- TOC entry 5042 (class 0 OID 24679)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash) FROM stdin;
1	clanck1410	$2b$10$KhLkpROCxfoJ9ArDTj/NNejTNMrPPErggSedi1wKtS4QPBH4x06Vm
\.


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 224
-- Name: files_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_files_id_seq', 5, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 221
-- Name: tags_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_tags_id_seq', 12, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- TOC entry 4888 (class 2606 OID 24816)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (files_id);


--
-- TOC entry 4882 (class 2606 OID 24736)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tags_id);


--
-- TOC entry 4884 (class 2606 OID 24738)
-- Name: tags tags_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tags_name_key UNIQUE (tags_name);


--
-- TOC entry 4886 (class 2606 OID 24857)
-- Name: tags_to_files tags_to_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_to_files
    ADD CONSTRAINT tags_to_files_pkey PRIMARY KEY (files_id, tags_id);


--
-- TOC entry 4878 (class 2606 OID 24689)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4880 (class 2606 OID 24691)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4889 (class 1259 OID 24882)
-- Name: idx_files_search_vector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_search_vector ON public.files USING gin (search_vector);


--
-- TOC entry 4893 (class 2620 OID 24786)
-- Name: tags_to_files trg_cleanup_unused_tags; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cleanup_unused_tags AFTER DELETE ON public.tags_to_files FOR EACH ROW EXECUTE FUNCTION public.delete_unused_tags();


--
-- TOC entry 4892 (class 2606 OID 24817)
-- Name: files files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4890 (class 2606 OID 24883)
-- Name: tags_to_files tags_to_files_files_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_to_files
    ADD CONSTRAINT tags_to_files_files_id_fkey FOREIGN KEY (files_id) REFERENCES public.files(files_id) ON DELETE CASCADE;


--
-- TOC entry 4891 (class 2606 OID 24747)
-- Name: tags_to_files tags_to_files_tags_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags_to_files
    ADD CONSTRAINT tags_to_files_tags_id_fkey FOREIGN KEY (tags_id) REFERENCES public.tags(tags_id) ON DELETE CASCADE;


-- Completed on 2026-11-22 05:02:01

--
-- PostgreSQL database dump complete
--

\unrestrict GokY9HRFUYadYQVQDX6RvmggIPrQQGWB5ExMK8PPIPgsizynKkMSwj5mPImJyEm

