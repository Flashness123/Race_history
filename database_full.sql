--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

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

ALTER TABLE IF EXISTS ONLY public.videos DROP CONSTRAINT IF EXISTS videos_uploaded_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.video_likes DROP CONSTRAINT IF EXISTS video_likes_video_id_fkey;
ALTER TABLE IF EXISTS ONLY public.video_likes DROP CONSTRAINT IF EXISTS video_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_submitted_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.results DROP CONSTRAINT IF EXISTS results_person_id_fkey;
ALTER TABLE IF EXISTS ONLY public.results DROP CONSTRAINT IF EXISTS results_event_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bios DROP CONSTRAINT IF EXISTS bios_user_id_fkey;
DROP INDEX IF EXISTS public.ix_videos_youtube_url;
DROP INDEX IF EXISTS public.ix_videos_youtube_id;
DROP INDEX IF EXISTS public.ix_videos_uploaded_by_user_id;
DROP INDEX IF EXISTS public.ix_videos_title;
DROP INDEX IF EXISTS public.ix_videos_like_count;
DROP INDEX IF EXISTS public.ix_video_likes_video_id;
DROP INDEX IF EXISTS public.ix_video_likes_user_id;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_race_events_year;
DROP INDEX IF EXISTS public.ix_race_events_name;
DROP INDEX IF EXISTS public.ix_people_full_name_norm;
DROP INDEX IF EXISTS public.ix_people_full_name;
DROP INDEX IF EXISTS public.ix_bios_user_id;
DROP INDEX IF EXISTS public.idx_race_events_geom;
ALTER TABLE IF EXISTS ONLY public.videos DROP CONSTRAINT IF EXISTS videos_pkey;
ALTER TABLE IF EXISTS ONLY public.video_likes DROP CONSTRAINT IF EXISTS video_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.video_likes DROP CONSTRAINT IF EXISTS uq_video_user_like;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uq_users_display_name_norm;
ALTER TABLE IF EXISTS ONLY public.results DROP CONSTRAINT IF EXISTS uq_event_position;
ALTER TABLE IF EXISTS ONLY public.submissions DROP CONSTRAINT IF EXISTS submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.results DROP CONSTRAINT IF EXISTS results_pkey;
ALTER TABLE IF EXISTS ONLY public.race_events DROP CONSTRAINT IF EXISTS race_events_pkey;
ALTER TABLE IF EXISTS ONLY public.people DROP CONSTRAINT IF EXISTS people_pkey;
ALTER TABLE IF EXISTS ONLY public.bios DROP CONSTRAINT IF EXISTS bios_pkey;
ALTER TABLE IF EXISTS ONLY public.alembic_version DROP CONSTRAINT IF EXISTS alembic_version_pkc;
ALTER TABLE IF EXISTS public.videos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.video_likes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.submissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.results ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.race_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.people ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bios ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.videos_id_seq;
DROP TABLE IF EXISTS public.videos;
DROP SEQUENCE IF EXISTS public.video_likes_id_seq;
DROP TABLE IF EXISTS public.video_likes;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.submissions_id_seq;
DROP TABLE IF EXISTS public.submissions;
DROP SEQUENCE IF EXISTS public.results_id_seq;
DROP TABLE IF EXISTS public.results;
DROP SEQUENCE IF EXISTS public.race_events_id_seq;
DROP TABLE IF EXISTS public.race_events;
DROP SEQUENCE IF EXISTS public.people_id_seq;
DROP TABLE IF EXISTS public.people;
DROP SEQUENCE IF EXISTS public.bios_id_seq;
DROP TABLE IF EXISTS public.bios;
DROP TABLE IF EXISTS public.alembic_version;
DROP TYPE IF EXISTS public.role;
DROP EXTENSION IF EXISTS postgis_topology;
DROP EXTENSION IF EXISTS postgis_tiger_geocoder;
DROP EXTENSION IF EXISTS postgis;
DROP EXTENSION IF EXISTS fuzzystrmatch;
DROP SCHEMA IF EXISTS topology;
DROP SCHEMA IF EXISTS tiger_data;
DROP SCHEMA IF EXISTS tiger;
--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO postgres;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO postgres;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO postgres;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'OWNER',
    'ADMIN',
    'USER'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: bios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bios (
    id integer NOT NULL,
    user_id integer NOT NULL,
    nationality character varying(2),
    place_of_birth character varying(160),
    date_of_birth date,
    message text,
    phone_number character varying(20),
    email character varying(255),
    instagram character varying(100),
    facebook character varying(100),
    youtube character varying(100),
    tiktok character varying(100)
);


ALTER TABLE public.bios OWNER TO postgres;

--
-- Name: bios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bios_id_seq OWNER TO postgres;

--
-- Name: bios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bios_id_seq OWNED BY public.bios.id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.people (
    id integer NOT NULL,
    full_name character varying(160) NOT NULL,
    country character varying(2),
    created_at timestamp without time zone NOT NULL,
    full_name_norm character varying(160)
);


ALTER TABLE public.people OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.people_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.people_id_seq OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.people_id_seq OWNED BY public.people.id;


--
-- Name: race_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.race_events (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    year integer NOT NULL,
    date_from timestamp without time zone,
    date_to timestamp without time zone,
    location character varying(200) NOT NULL,
    geom public.geography(Point,4326),
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    source_url character varying,
    image_url character varying(400),
    category character varying(20),
    track_record_open_name character varying(200),
    track_record_open_time character varying(50),
    track_record_luge_name character varying(200),
    track_record_luge_time character varying(50),
    track_record_woman_name character varying(200),
    track_record_woman_time character varying(50),
    organizer_name character varying(200)
);


ALTER TABLE public.race_events OWNER TO postgres;

--
-- Name: race_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.race_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.race_events_id_seq OWNER TO postgres;

--
-- Name: race_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.race_events_id_seq OWNED BY public.race_events.id;


--
-- Name: results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.results (
    id integer NOT NULL,
    event_id integer NOT NULL,
    person_id integer NOT NULL,
    "position" integer NOT NULL,
    time_str character varying,
    notes character varying,
    category character varying(20)
);


ALTER TABLE public.results OWNER TO postgres;

--
-- Name: results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.results_id_seq OWNER TO postgres;

--
-- Name: results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.results_id_seq OWNED BY public.results.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    submitted_by_user_id integer,
    payload json NOT NULL,
    status character varying(20) NOT NULL,
    review_note character varying,
    submission_type character varying(20) DEFAULT 'NEW'::character varying NOT NULL
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(120),
    password_hash character varying(255) NOT NULL,
    role public.role NOT NULL,
    is_active boolean NOT NULL,
    can_submit boolean NOT NULL,
    display_name character varying(160),
    display_name_norm character varying(160),
    profile_image_url character varying(400)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_likes (
    id integer NOT NULL,
    video_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.video_likes OWNER TO postgres;

--
-- Name: video_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.video_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_likes_id_seq OWNER TO postgres;

--
-- Name: video_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.video_likes_id_seq OWNED BY public.video_likes.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    youtube_url character varying(500) NOT NULL,
    youtube_id character varying(50) NOT NULL,
    thumbnail_url character varying(500),
    uploaded_by_user_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    is_active boolean NOT NULL,
    like_count integer NOT NULL
);


ALTER TABLE public.videos OWNER TO postgres;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO postgres;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: bios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bios ALTER COLUMN id SET DEFAULT nextval('public.bios_id_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Name: race_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.race_events ALTER COLUMN id SET DEFAULT nextval('public.race_events_id_seq'::regclass);


--
-- Name: results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.results ALTER COLUMN id SET DEFAULT nextval('public.results_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_likes ALTER COLUMN id SET DEFAULT nextval('public.video_likes_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
97b1c02e13e7
\.


--
-- Data for Name: bios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bios (id, user_id, nationality, place_of_birth, date_of_birth, message, phone_number, email, instagram, facebook, youtube, tiktok) FROM stdin;
1	2	DE	eber	2222-01-01	Gotcha!	\N	\N	\N	\N	\N	\N
2	3	GE	Ebe	2002-05-05	Twerk	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.people (id, full_name, country, created_at, full_name_norm) FROM stdin;
1	luka		2025-09-15 16:12:12.036944	luka
2	Lukas		2025-09-15 16:12:44.295317	lukas
3	me		2025-09-15 18:54:07.744453	me
4	you		2025-09-15 18:54:07.745468	you
5	them		2025-09-15 18:54:07.74721	them
6	dsad		2025-09-15 19:52:39.79909	dsad
7	asd		2025-09-15 19:52:39.800313	asd
8			2025-09-15 19:56:14.443816	\N
9	a		2025-10-08 20:24:06.991669	a
10	b		2025-10-08 20:24:06.993097	b
11	c		2025-10-08 20:24:06.995157	c
12	Andii		2025-10-09 11:42:54.122292	andii
13	Bernd		2025-10-09 11:42:54.123545	bernd
14	Brunoi		2025-10-09 11:42:54.125363	brunoi
15	owner		2025-10-09 13:18:27.570181	owner
16	Carlotti		2025-10-10 11:57:23.882595	carlotti
17	Andreas		2025-10-10 11:57:23.884043	andreas
18	Diego		2025-10-10 11:57:23.885815	diego
39	Harry Clarke	\N	2025-10-20 16:45:52.185592	harryclarke
40	Maxwell Capps	\N	2025-10-20 16:45:52.187948	maxwellcapps
41	Dane Hanna	\N	2025-10-20 16:45:52.190381	danehanna
42	Mikel Echegaray Diez	\N	2025-10-20 16:45:52.19212	mikelechegaraydiez
43	Ryan Farmer	\N	2025-10-20 16:45:52.193909	ryanfarmer
44	Kolby Parks	\N	2025-10-20 16:45:52.195091	kolbyparks
45	Emily Pross	\N	2025-10-20 16:45:52.196509	emilypross
46	Teresa Gillcrist	\N	2025-10-20 16:45:52.198202	teresagillcrist
47	Nashley Alameda	\N	2025-10-20 16:45:52.199397	nashleyalameda
48	Mitch Thompson	\N	2025-10-20 16:46:15.084306	mitchthompson
49	Daina Banks	\N	2025-10-20 16:46:15.087295	dainabanks
50	Abdil Mahdzan	\N	2025-10-20 16:46:15.090352	abdilmahdzan
51	Graham Brittain	\N	2025-10-20 16:46:15.092255	grahambrittain
52	Elissa Mah	\N	2025-10-20 16:46:15.096971	elissamah
53	Morgan Owens	\N	2025-10-20 16:46:17.624024	morganowens
54	Joshua Evans	\N	2025-10-20 16:46:17.626234	joshuaevans
55	Roberto Rengifo	\N	2025-10-20 16:46:17.628017	robertorengifo
56	Kevin Guevara	\N	2025-10-20 16:46:17.629525	kevinguevara
57	Sabrina Ambrosi	\N	2025-10-20 16:46:17.631151	sabrinaambrosi
58	Angie Duque	\N	2025-10-20 16:46:17.63289	angieduque
59	Sirley Tabares	\N	2025-10-20 16:46:17.634271	sirleytabares
60	Esneider Osorno	\N	2025-10-20 16:46:18.442605	esneiderosorno
61	Lucas Bailon	\N	2025-10-20 16:46:18.444606	lucasbailon
62	Ramallo Augusto	\N	2025-10-20 16:46:18.44593	ramalloaugusto
63	Vanessa Curra	\N	2025-10-20 16:46:18.44856	vanessacurra
64	Antonella Olivera	\N	2025-10-20 16:46:18.450111	antonellaolivera
65	Chase Hiller	\N	2025-10-20 16:46:19.176296	chasehiller
66	Jennifer Butler	\N	2025-10-20 16:46:19.17959	jenniferbutler
67	Laura Vargas	\N	2025-10-20 16:46:19.183933	lauravargas
70	Andrew Atchison	\N	2025-10-20 16:46:26.424115	andrewatchison
71	Olivier Gerling	\N	2025-10-20 16:46:26.426938	oliviergerling
72	Ulrich Becker	\N	2025-10-20 16:46:26.428641	ulrichbecker
73	Pearse d’Arcy	\N	2025-10-20 16:46:27.346006	pearsedarcy
74	Andrej Ilic	\N	2025-10-20 16:46:27.350312	andrejilic
75	Lisa Peters	\N	2025-10-20 16:46:27.35197	lisapeters
76	Feiyane Ruegg	\N	2025-10-20 16:46:27.353374	feiyaneruegg
84	Grace Wong	\N	2025-10-20 16:56:18.344327	gracewong
85	Diego Poncelet	\N	2025-10-20 16:57:35.806499	diegoponcelet
86	Tim Koch	\N	2025-10-20 16:57:35.809783	timkoch
87	Ira Hewton	\N	2025-10-20 16:57:35.81087	irahewton
88	Yan Triponez	\N	2025-10-20 16:57:35.812466	yantriponez
89	Ashley Winecoff	\N	2025-10-20 16:57:35.81464	ashleywinecoff
90	Olivier Filiatrault	\N	2025-10-20 16:57:36.901314	olivierfiliatrault
91	Nicholas Broms	\N	2025-10-20 16:57:37.723244	nicholasbroms
92	Julian Slaney	\N	2025-10-20 16:57:37.730193	julianslaney
93	Lea Richard	\N	2025-10-20 16:57:37.732459	learichard
94	Jennifer Schauerte	\N	2025-10-20 16:57:39.293201	jenniferschauerte
95	John Doe	\N	2025-10-20 17:06:25.671297	johndoe
96	Alice Brown	\N	2025-10-20 17:06:25.677771	alicebrown
97	Eve Davis	\N	2025-10-20 17:06:25.679455	evedavis
98	Jane Smith	\N	2025-10-20 17:08:14.08193	janesmith
99	Charlie Wilson	\N	2025-10-20 17:08:14.085903	charliewilson
100	Frank Miller	\N	2025-10-20 17:08:14.087731	frankmiller
101	Bob Johnson	\N	2025-10-20 17:08:14.862668	bobjohnson
102	Diana Lee	\N	2025-10-20 17:08:14.865005	dianalee
103	Grace Taylor	\N	2025-10-20 17:08:14.866531	gracetaylor
104	Winner	\N	2025-10-20 17:19:09.092476	winner
105	Second	\N	2025-10-20 17:19:09.0984	second
106	Third	\N	2025-10-20 17:19:09.100097	third
107	Qualifier 1	\N	2025-10-20 17:19:09.101596	qualifier1
108	Qualifier 2	\N	2025-10-20 17:19:09.103149	qualifier2
109	Qualifier 3	\N	2025-10-20 17:19:09.104801	qualifier3
110	Qualifier 4	\N	2025-10-20 17:19:09.106273	qualifier4
111	Qualifier 5	\N	2025-10-20 17:19:09.107645	qualifier5
117	Open Winner	\N	2025-10-20 17:56:17.976891	open winner
118	Open Second	\N	2025-10-20 17:56:17.977858	open second
119	Open Third	\N	2025-10-20 17:56:17.979462	open third
120	Luge Winner	\N	2025-10-20 17:56:17.980279	luge winner
121	Luge Second	\N	2025-10-20 17:56:17.981117	luge second
122	Luge Third	\N	2025-10-20 17:56:17.981991	luge third
123	Women Winner	\N	2025-10-20 17:56:17.982817	women winner
124	Women Second	\N	2025-10-20 17:56:17.983678	women second
125	Women Third	\N	2025-10-20 17:56:17.984514	women third
126	Qualifier 1	\N	2025-10-20 17:56:17.985338	qualifier 1
127	Qualifier 2	\N	2025-10-20 17:56:17.986284	qualifier 2
128	Qualifier 3	\N	2025-10-20 17:56:17.987276	qualifier 3
129	Open Winner	\N	2025-10-20 18:07:54.392738	openwinner
130	Open Second	\N	2025-10-20 18:07:54.399491	opensecond
131	Open Third	\N	2025-10-20 18:07:54.401271	openthird
132	Luge Winner	\N	2025-10-20 18:07:54.402895	lugewinner
133	Luge Second	\N	2025-10-20 18:07:54.404466	lugesecond
134	Luge Third	\N	2025-10-20 18:07:54.406085	lugethird
135	Women Winner	\N	2025-10-20 18:07:54.407592	womenwinner
136	Women Second	\N	2025-10-20 18:07:54.409309	womensecond
137	Women Third	\N	2025-10-20 18:07:54.411925	womenthird
138	Qualifier 6	\N	2025-10-20 18:13:43.466693	qualifier6
139	Qualifier 7	\N	2025-10-20 18:13:43.468535	qualifier7
140	Qualifier 8	\N	2025-10-20 18:13:43.470004	qualifier8
141	Qualifier 9	\N	2025-10-20 18:13:43.471445	qualifier9
142	Qualifier 10	\N	2025-10-20 18:13:43.472881	qualifier10
143	Emily	\N	2025-10-20 18:28:08.398529	emily
144	Greg	\N	2025-10-20 18:28:08.400947	greg
145	Allah	\N	2025-10-20 18:28:08.402558	allah
146	Houston	\N	2025-10-20 18:28:08.404059	houston
147	Emilia	\N	2025-10-20 18:28:08.405609	emilia
148	Mario	\N	2025-10-20 18:38:01.392605	mario
149	Luigi	\N	2025-10-20 18:38:01.39463	luigi
150	Prince	\N	2025-10-20 18:38:01.396309	prince
151	Fik	\N	2025-10-20 18:38:01.397876	fik
152	None	\N	2025-10-20 18:38:01.399433	none
153	Bruce	\N	2025-10-20 19:06:02.401508	bruce
154	Bryce	\N	2025-10-20 19:06:08.811906	bryce
155	Pending Winner	\N	2025-10-20 19:06:11.422947	pendingwinner
156	Pending Second	\N	2025-10-20 19:06:11.425643	pendingsecond
157	Pending Luge Winner	\N	2025-10-20 19:06:11.427428	pendinglugewinner
158	Tina	\N	2025-10-20 19:37:10.193605	tina
159	pearce d'arcy	\N	2025-10-20 21:20:44.504616	pearcedarcy
\.


--
-- Data for Name: race_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.race_events (id, name, year, date_from, date_to, location, geom, lat, lng, source_url, image_url, category, track_record_open_name, track_record_open_time, track_record_luge_name, track_record_luge_time, track_record_woman_name, track_record_woman_time, organizer_name) FROM stdin;
74	La Violenta 2019	2019	2019-08-23 00:00:00	2019-08-25 00:00:00	la rioja argentina	0101000020E6100000869CAD7257C750C01F9441FF4EC83DC0	-29.7824554	-67.1147124	https://internationaldownhillfederation.org/races/la-violenta-2019/	/static/uploads/events/event_1.jpg	IDF	\N	\N	\N	\N	\N	\N	\N
75	Tour de Maryhill 2019	2019	2019-08-30 00:00:00	2019-01-09 00:00:00	Goldendale	0101000020E610000000C79E3D97345EC01EC0C7050CE94640	45.8206794	-120.821731	https://internationaldownhillfederation.org/races/maryhill-gp-2019/	/static/uploads/events/event_2.jpg	IDF	Dane Hanna	3,01.03 (set in 2019)	Ryan Farmer	2,57.53 (set in 2019)	Emily Pross	3,03.82 (set in 2019)	\N
76	Yaku Raymi 2019	2019	2019-09-13 00:00:00	2019-09-15 00:00:00	Huallin	0101000020E61000007CE24A87185B53C041594288755C22C0	-9.1805842	-77.4233721	https://internationaldownhillfederation.org/races/yaku-raymi-2019/	/static/uploads/events/event_4.jpg	IDF	\N	\N	\N	\N	\N	\N	\N
77	Newton’s 2019	2019	2019-05-04 00:00:00	2019-07-04 00:00:00	Bathurst	0101000020E6100000BE1248895D9330C09A779CA223E92A40	13.45535	-16.575646	https://internationaldownhillfederation.org/races/newtons-2019/	/static/uploads/events/event_2.jpg	IDF	\N	\N	\N	\N	\N	\N	\N
78	La Virgen 2019	2019	2019-02-08 00:00:00	2019-03-08 00:00:00	Cali	0101000020E610000045A1C096322553C08331225168490B40	3.4108435	-76.5812127	https://internationaldownhillfederation.org/races/la-virgen-2019/	/static/uploads/events/event_6.jpg	IDF	Mitch Thompson	1,27.46 (set in 2019)	Roberto Elias Leiva Rengifo	1,37.49 (set in 2019)	Sabrina Ambrosi	1,35.78 (set in 2019)	\N
79	La Leonera DH 2019	2019	2019-09-08 00:00:00	2019-11-08 00:00:00	La Leonera	0101000020E61000008CA19C68D74052C05503835AC27942C0	-36.9512437	-73.0131475	https://internationaldownhillfederation.org/races/la-leonera-dh-2019/	/static/uploads/events/event_1.jpg	IDF	Harry Clarke	2,11.34 (set in 2019)	Roberto Elias Leiva Rengifo	2,26.21 (set in 2019)	Sabrina Ambrosi	2,22.44 (set in 2019)	\N
81	Gravity Fest 2019	2019	2019-01-06 00:00:00	2019-02-06 00:00:00	Munnsville	0101000020E6100000757286E28EE552C0286211C30E7D4540	42.977013	-75.586846	https://internationaldownhillfederation.org/races/gravity-fest-2019/	/static/uploads/events/event_4.jpg	IDF	Nicholas Broms	1,46.830 (set in 2018)	Kolby Parks	1,45.15 (set in 2019)	Emily Pross	1,47.510 (set in 2018)	\N
82	Seaside 2019	2019	2019-04-22 00:00:00	2019-04-23 00:00:00	Cavite	0101000020E6100000DDCDF8637F375E40BF51E1BEC4822C40	14.2554073	120.8671503	https://internationaldownhillfederation.org/races/seaside-2019/	/static/uploads/events/event_4.jpg	IDF	Mitch Thompson	1,26.98 (set in 2019)	Abdil Mahdzan	1,27.550 (set in 2018)	Emily Pross	1,28.570 (set in 2018)	\N
83	Transylvania DH 2019	2019	2019-07-26 00:00:00	2019-07-28 00:00:00	Vulcan	0101000020E6100000692AD54F494B374079B8D38CFBAF4640	45.3748642	23.2940874	https://internationaldownhillfederation.org/races/transylvania-dh-2019/	/static/uploads/events/event_6.jpg	IDF	Chase Hiller	2,13.75 (set in 2019)	Ulrich Becker	2,16.28 (set in 2019)	Lisa Peters	2,33.9 (set in 2019)	\N
84	Killington 2019	2019	2019-06-14 00:00:00	2019-06-16 00:00:00	Killington	0101000020E61000001250E108D23152C0185B087250D64540	43.67433	-72.7784445	https://internationaldownhillfederation.org/races/killington-2019/	/static/uploads/events/event_3.jpg	IDF	Oscar Rodriguez Escoin	1,53.69 (set in 2018)	Frank Williams	1,51.35 (set in 2018)	Emily Pross	1,55.55 (set in 2017)	\N
85	Tame the Taipan 2019	2019	2019-12-04 00:00:00	2019-04-14 00:00:00	Gold Coast	0101000020E6100000DA2E7E64442D6340E0E302869B003CC0	-28.0023731	153.4145987	https://internationaldownhillfederation.org/races/tame-the-taipan-2019/	/static/uploads/events/event_4.jpg	IDF	\N	\N	\N	\N	\N	\N	\N
86	Keeping It High 2019	2019	2019-04-25 00:00:00	2019-04-26 00:00:00	Nasugbu	0101000020E610000012ADCBDF73285E409F48E647B2252C40	14.0736258	120.6320724	https://internationaldownhillfederation.org/races/keeping-it-high-2019/	/static/uploads/events/event_2.jpg	IDF	Harry Clarke	1,38.250 (set in 2019)	Abdil Mahdzan	1,38.550 (set in 2019)	Emily Pross	1,40.900 (set in 2019)	\N
87	Verdicchio Race 2019	2019	2019-10-07 00:00:00	2019-07-13 00:00:00	Poggiocupro	\N	0	0	https://internationaldownhillfederation.org/races/verdicchio-race-2019/	/static/uploads/events/event_6.jpg	IDF	Nicholas Broms	2,18.19 (set in 2019)	Abdil Mahdzan	2,17.53 (set in 2018)	Emily Pross	2,20.39 (set in 2018)	\N
88	Test Many Qualifiers Event	2024	2024-01-15 00:00:00	\N	Test Location	0101000020E61000000000000000002C400000000000004940	50	14	\N	/static/uploads/events/event_5.jpg	WDSC	\N	\N	\N	\N	\N	\N	\N
89	Admin Test Event - All Categories	2024	2024-01-15 00:00:00	2024-01-16 00:00:00	Test Location for Admin	0101000020E61000000000000000002C400000000000004940	50	14	https://example.com/event	/static/uploads/events/event_4.jpg	WDSC	Track Record Holder	1:23.45	Luge Record Holder	1:20.30	Women Record Holder	1:25.15	\N
90	Monteciano	2025	2025-08-05 00:00:00	2025-08-07 00:00:00	Unknown	0101000020E6100000A0C651DAA7592840D493479E58A84540	43.3152044152736	12.175108740312965	\N	/static/uploads/events/90_6ea6ae17.png	WDSC	\N	\N	\N	\N	\N	\N	\N
91	montenegro	2025	2025-10-20 00:00:00	\N	Unknown	0101000020E610000060D28A15E3D52E40E83A4DA6282D4940	50.352803027830134	15.417748139568346	\N	/static/uploads/events/event_6.jpg	WDSC	\N	\N	\N	\N	\N	\N	\N
92	Test Edit Event	2024	2024-01-15 00:00:00	\N	Test Location	0101000020E61000000000000000002C400000000000004940	50	14	\N	/static/uploads/events/event_4.jpg	WDSC	\N	\N	\N	\N	\N	\N	\N
95	Complete Test Event	2024	2024-01-15 00:00:00	2024-01-16 00:00:00	Test Location	0101000020E61000000000000000002C400000000000004940	50	14	https://example.com/event	/static/uploads/events/event_4.jpg	WDSC	Track Record Holder	1:23.45	Luge Record Holder	1:20.30	Women Record Holder	1:25.15	\N
96	Incomplete Test Event	2024	2024-01-15 00:00:00	\N	Test Location	0101000020E61000000000000000002C400000000000004940	50	14	\N	/static/uploads/events/event_6.jpg	WDSC	\N	\N	\N	\N	\N	\N	\N
80	Kozakov Challenge 2019	2019	2019-07-16 00:00:00	2019-07-19 00:00:00	Kozakov	0101000020E6100000666F84A0FE862E403F56F0DB104C4940	50.5942645	15.2636614	https://internationaldownhillfederation.org/races/kozakov-challenge-2019/	/static/uploads/events/event_2.jpg	IDF	\N	\N	\N	\N	\N	\N	\N
97	Izoard	2025	2025-10-20 00:00:00	\N	Unknown	0101000020E6100000D4E5DE0DB3510440530E1C8645614640	44.7599342	2.5398923	\N	/static/uploads/events/event_1.jpg	SPOT	\N	\N	\N	\N	\N	\N	\N
94	Updated Test Event	2024	2024-01-15 00:00:00	2024-01-16 00:00:00	Updated Location	0101000020E61000000000000000002E400000000000804940	51	15	https://example.com/updated	/static/uploads/events/event_1.jpg	EURO	Record Holder	1:23.45	\N	\N	\N	\N	\N
101	fsdaf	2025	2025-10-24 00:00:00	\N	Unknown	0101000020E61000000FEECEDA6DD72C40B35E0CE5440B4940	50.08804	14.42076	\N	/static/uploads/events/event_3.jpg	WDSC	\N	\N	\N	\N	\N	\N	
98	Pending Test Event	2024	2024-01-15 00:00:00	2024-01-16 00:00:00	Test Location	0101000020E61000000000000000002C400000000000004940	50	14	https://example.com/event	/static/uploads/events/event_4.jpg	WDSC	Pending Record Holder	1:23.45	\N	\N	\N	\N	\N
100	tina 2	2025	2025-10-20 00:00:00	\N	Unknown	0101000020E610000030D25A3360532C40446A3BD98C434940	50.527735857020645	14.162843327366403	\N	/static/uploads/events/event_2.jpg	WDSC	\N	\N	\N	\N	\N	\N	\N
99	Tina	2025	2025-09-30 00:00:00	\N	Unknown	0101000020E6100000B18C68965F0D294056ECD401B54F4940	50.6227114	12.5261199	\N	/static/uploads/events/event_5.jpg	EURO	\N	\N	\N	\N	\N	\N	\N
93	newrace	2025	2025-10-18 00:00:00	\N	Unknown	0101000020E6100000A04E6D74DECA2A40EC54111458E44840	49.783937939131505	13.396228445380359	\N	/static/uploads/events/event_3.jpg	WDSC	\N	\N	\N	\N	\N	\N	pearce d'arcy
\.


--
-- Data for Name: results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.results (id, event_id, person_id, "position", time_str, notes, category) FROM stdin;
226	74	39	1	\N	\N	OPEN
227	74	49	2	\N	\N	OPEN
228	74	60	3	\N	\N	OPEN
229	74	61	11	\N	\N	LUGE
230	74	62	12	\N	\N	LUGE
231	74	55	13	\N	\N	LUGE
232	74	57	21	\N	\N	WOMAN
233	74	63	22	\N	\N	WOMAN
234	74	64	23	\N	\N	WOMAN
235	75	39	1	\N	\N	OPEN
236	75	40	2	\N	\N	OPEN
237	75	41	3	\N	\N	OPEN
238	75	42	11	\N	\N	LUGE
239	75	43	12	\N	\N	LUGE
240	75	44	13	\N	\N	LUGE
241	75	45	21	\N	\N	WOMAN
242	75	46	22	\N	\N	WOMAN
243	75	47	23	\N	\N	WOMAN
244	77	48	1	\N	\N	OPEN
245	77	40	2	\N	\N	OPEN
246	77	49	3	\N	\N	OPEN
247	77	50	11	\N	\N	LUGE
248	77	51	12	\N	\N	LUGE
249	77	44	13	\N	\N	LUGE
250	77	45	21	\N	\N	WOMAN
251	77	46	22	\N	\N	WOMAN
252	77	52	23	\N	\N	WOMAN
253	78	49	1	\N	\N	OPEN
254	78	53	2	\N	\N	OPEN
255	78	54	3	\N	\N	OPEN
256	78	55	11	\N	\N	LUGE
257	78	56	12	\N	\N	LUGE
258	78	57	21	\N	\N	WOMAN
259	78	58	22	\N	\N	WOMAN
260	78	59	23	\N	\N	WOMAN
261	79	39	1	\N	\N	OPEN
262	79	65	2	\N	\N	OPEN
263	79	53	3	\N	\N	OPEN
264	79	55	11	\N	\N	LUGE
265	79	66	12	\N	\N	LUGE
266	79	56	13	\N	\N	LUGE
267	79	57	21	\N	\N	WOMAN
268	79	58	22	\N	\N	WOMAN
269	79	67	23	\N	\N	WOMAN
279	81	41	1	\N	\N	OPEN
280	81	85	2	\N	\N	OPEN
281	81	65	3	\N	\N	OPEN
282	81	86	11	\N	\N	LUGE
283	81	87	12	\N	\N	LUGE
284	81	88	13	\N	\N	LUGE
285	81	45	21	\N	\N	WOMAN
286	81	89	22	\N	\N	WOMAN
287	81	46	23	\N	\N	WOMAN
288	82	39	1	\N	\N	OPEN
289	82	48	2	\N	\N	OPEN
290	82	70	3	\N	\N	OPEN
291	82	50	11	\N	\N	LUGE
292	82	71	12	\N	\N	LUGE
293	82	72	13	\N	\N	LUGE
294	82	45	21	\N	\N	WOMAN
295	82	46	22	\N	\N	WOMAN
296	82	52	23	\N	\N	WOMAN
297	83	65	1	\N	\N	OPEN
298	83	39	2	\N	\N	OPEN
299	83	73	3	\N	\N	OPEN
300	83	71	11	\N	\N	LUGE
301	83	72	12	\N	\N	LUGE
302	83	74	13	\N	\N	LUGE
303	83	75	21	\N	\N	WOMAN
304	83	76	22	\N	\N	WOMAN
305	83	52	23	\N	\N	WOMAN
306	84	41	1	\N	\N	OPEN
307	84	49	2	\N	\N	OPEN
308	84	45	3	\N	\N	OPEN
309	84	44	11	\N	\N	LUGE
310	84	86	12	\N	\N	LUGE
311	84	90	13	\N	\N	LUGE
312	84	45	21	\N	\N	WOMAN
313	85	91	1	\N	\N	OPEN
314	85	39	2	\N	\N	OPEN
315	85	65	3	\N	\N	OPEN
316	85	44	11	\N	\N	LUGE
317	85	51	12	\N	\N	LUGE
318	85	92	13	\N	\N	LUGE
319	85	45	21	\N	\N	WOMAN
320	85	93	22	\N	\N	WOMAN
321	85	52	23	\N	\N	WOMAN
322	87	91	1	\N	\N	OPEN
323	87	41	2	\N	\N	OPEN
324	87	65	3	\N	\N	OPEN
325	87	50	11	\N	\N	LUGE
326	87	71	12	\N	\N	LUGE
327	87	72	13	\N	\N	LUGE
328	87	45	21	\N	\N	WOMAN
329	87	75	22	\N	\N	WOMAN
330	87	94	23	\N	\N	WOMAN
331	88	129	1	\N	\N	OPEN
332	88	130	2	\N	\N	OPEN
333	88	131	3	\N	\N	OPEN
334	88	107	101	\N	\N	QUALIFIER
335	88	108	102	\N	\N	QUALIFIER
336	88	109	103	\N	\N	QUALIFIER
337	88	110	104	\N	\N	QUALIFIER
338	88	111	105	\N	\N	QUALIFIER
339	88	138	106	\N	\N	QUALIFIER
340	88	139	107	\N	\N	QUALIFIER
341	88	140	108	\N	\N	QUALIFIER
342	88	141	109	\N	\N	QUALIFIER
343	88	142	110	\N	\N	QUALIFIER
344	89	129	1	\N	\N	OPEN
345	89	130	2	\N	\N	OPEN
346	89	131	3	\N	\N	OPEN
347	89	132	11	\N	\N	LUGE
348	89	133	12	\N	\N	LUGE
349	89	135	21	\N	\N	WOMAN
350	89	136	22	\N	\N	WOMAN
351	89	137	23	\N	\N	WOMAN
352	89	107	101	\N	\N	QUALIFIER
353	89	108	102	\N	\N	QUALIFIER
354	89	109	103	\N	\N	QUALIFIER
355	89	110	104	\N	\N	QUALIFIER
356	90	18	1	\N	\N	OPEN
357	90	143	2	\N	\N	OPEN
358	90	144	3	\N	\N	OPEN
359	90	145	11	\N	\N	LUGE
360	90	146	12	\N	\N	LUGE
361	90	147	13	\N	\N	LUGE
362	90	85	14	\N	\N	LUGE
369	95	129	1	\N	\N	OPEN
370	95	130	2	\N	\N	OPEN
371	95	132	11	\N	\N	LUGE
372	95	135	21	\N	\N	WOMAN
373	95	107	101	\N	\N	QUALIFIER
374	95	108	102	\N	\N	QUALIFIER
375	80	49	1	\N	\N	OPEN
376	80	39	2	\N	\N	OPEN
377	80	65	3	\N	\N	OPEN
378	80	43	11	\N	\N	LUGE
379	80	42	12	\N	\N	LUGE
380	80	50	13	\N	\N	LUGE
381	80	45	21	\N	\N	WOMAN
382	80	75	22	\N	\N	WOMAN
383	80	84	23	\N	\N	WOMAN
384	80	85	101	\N	\N	QUALIFIER
385	94	104	1	\N	\N	OPEN
395	98	155	1	\N	\N	OPEN
396	98	156	2	\N	\N	OPEN
397	98	157	11	\N	\N	LUGE
401	100	158	1	\N	\N	OPEN
402	100	158	11	\N	\N	LUGE
403	100	158	12	\N	\N	LUGE
404	100	158	13	\N	\N	LUGE
405	100	158	21	\N	\N	WOMAN
406	100	158	22	\N	\N	WOMAN
407	100	158	23	\N	\N	WOMAN
408	99	158	21	\N	\N	WOMAN
409	99	158	22	\N	\N	WOMAN
410	99	158	23	\N	\N	WOMAN
416	93	18	1	\N	\N	OPEN
417	93	148	2	\N	\N	OPEN
418	93	149	3	\N	\N	OPEN
419	93	154	4	\N	\N	OPEN
420	93	152	101	\N	\N	QUALIFIER
421	93	159	999	\N	\N	ORGANIZER
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, submitted_by_user_id, payload, status, review_note, submission_type) FROM stdin;
1	1	{"name": "das", "year": 2025, "location": "", "lat": 50.29436279564351, "lng": 13.409102508672703, "source_url": "", "top3": [{"name": "luka", "country": "", "instagram": "", "position": 1}, {"name": "asd", "country": "", "instagram": "", "position": 2}, {"name": "asd", "country": "", "instagram": "", "position": 3}]}	APPROVED	\N	NEW
2	2	{"name": "lukas", "year": 2025, "location": "", "lat": 49.98454394139762, "lng": 16.25456149304827, "source_url": "", "top3": [{"name": "Lukas", "country": "", "instagram": "", "position": 1}, {"name": "dasd", "country": "", "instagram": "", "position": 2}, {"name": "asd", "country": "", "instagram": "", "position": 3}]}	APPROVED	\N	NEW
3	2	{"name": "kozakov", "year": 2025, "location": "", "lat": 50.0579000241016, "lng": 13.935731765966295, "source_url": "", "top3": [{"name": "me", "country": "", "instagram": "", "position": 1}, {"name": "you", "country": "", "instagram": "", "position": 2}, {"name": "them", "country": "", "instagram": "", "position": 3}]}	APPROVED	\N	NEW
4	2	{"name": "asd", "year": 2025, "location": "", "lat": 50.08804, "lng": 14.42076, "event_url": "das", "youtube_url": "sad", "is_future": false, "top3": [{"name": "dsad", "country": "", "instagram": "", "position": 1}, {"name": "asd", "country": "", "instagram": "", "position": 2}, {"name": "Lukas", "country": "", "instagram": "", "position": 3}]}	APPROVED	\N	NEW
5	2	{"name": "asd", "year": 2026, "location": "", "lat": 50.57836975276069, "lng": 12.694256900569059, "event_url": "", "youtube_url": "", "is_future": false, "top3": [{"name": "", "country": "", "instagram": "", "position": 1}, {"name": "", "country": "", "instagram": "", "position": 2}, {"name": "", "country": "", "instagram": "", "position": 3}]}	APPROVED	\N	NEW
9	2	{"name": "Sornetan", "year": 2025, "location": "", "lat": 47.27039536664901, "lng": 8.080438151740992, "event_url": "", "youtube_url": "", "is_future": false, "category": "EURO", "top3": [{"name": "a", "country": "", "instagram": "", "position": 1}, {"name": "b", "country": "", "instagram": "", "position": 2}, {"name": "c", "country": "", "instagram": "", "position": 3}], "date_from": "2025-09-29", "date_to": null}	APPROVED	\N	NEW
10	2	{"name": "Grosserlach", "year": 2025, "location": "", "lat": 51.29499993707677, "lng": 11.27590668359548, "event_url": "", "youtube_url": "", "is_future": false, "category": "EURO", "top3": [{"name": "Andii", "country": "", "instagram": "", "position": 1}, {"name": "Bernd", "country": "", "instagram": "", "position": 2}, {"name": "Brunoi", "country": "", "instagram": "", "position": 3}], "date_from": "2025-10-07", "date_to": null}	APPROVED	\N	NEW
11	2	{"name": "test", "year": 2025, "location": "", "lat": 50.988899493916904, "lng": 17.03122318678072, "event_url": "", "youtube_url": "", "is_future": false, "category": "EURO", "top3": [{"name": "owner", "country": "", "instagram": "", "position": 1}, {"name": "Owner", "country": "", "instagram": "", "position": 2}, {"name": "owner", "country": "", "instagram": "", "position": 3}], "date_from": "2025-10-09", "date_to": null}	APPROVED	\N	NEW
12	2	{"name": "hvb", "year": 2025, "location": "", "lat": 51.55268706823034, "lng": 6.896929664227457, "event_url": "", "youtube_url": "", "is_future": false, "category": "FREERIDE", "top3": [{"name": "", "country": "", "instagram": "", "position": 1}, {"name": "", "country": "", "instagram": "", "position": 2}, {"name": "", "country": "", "instagram": "", "position": 3}], "date_from": "2025-10-09", "date_to": null}	APPROVED	\N	NEW
13	2	{"name": "weqdada", "year": 2025, "location": "asdf", "lat": 50.51096311286082, "lng": 9.854545051827529, "event_url": "", "youtube_url": "", "is_future": false, "category": "WDSC", "top3": [{"name": "Carlotti", "country": "", "instagram": "", "position": 1}, {"name": "Andreas", "country": "", "instagram": "", "position": 2}, {"name": "Diego", "country": "", "instagram": "", "position": 3}], "date_from": "2025-10-10", "date_to": null}	APPROVED	\N	NEW
58	1	{"name": "Test Spot", "date_from": "2024-01-15", "date_to": null, "location": "Prague", "lat": 50.0874654, "lng": 14.4212535, "category": "SPOT", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
108	2	{"name": "Tina", "date_from": "2025-10-01", "date_to": null, "location": null, "lat": 50.6227114, "lng": 12.5261199, "category": "EURO", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [{"name": "Tina", "position": 1}, {"name": "Tina", "position": 2}, {"name": "Tina", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null, "_uploaded_image_url": "/static/uploads/events/108_334bcff9.png"}	APPROVED	\N	NEW
28	2	{"name": "Tour de Maryhill 2019", "date_from": "2019-08-30", "date_to": "2019-01-09", "location": "Goldendale", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/maryhill-gp-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Dane Hanna", "position": 3}], "top_riders_luge": [{"name": "Mikel Echegaray Diez", "position": 1}, {"name": "Ryan Farmer", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Nashley Alameda", "position": 3}], "track_record_open": {"name": "Dane Hanna", "time": "3,01.03 (set in 2019)"}, "track_record_luge": {"name": "Ryan Farmer", "time": "2,57.53 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "3,03.82 (set in 2019)"}}	APPROVED	\N	NEW
30	2	{"name": "Newton\\u2019s 2019", "date_from": "2019-05-04", "date_to": "2019-07-04", "location": "Bathurst", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/newtons-2019/"}], "top_riders_open": [{"name": "Mitch Thompson", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Daina Banks", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
31	2	{"name": "La Virgen 2019", "date_from": "2019-02-08", "date_to": "2019-03-08", "location": "Cali", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-virgen-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Morgan Owens", "position": 2}, {"name": "Joshua Evans", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Kevin Guevara", "position": 2}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Sirley Tabares", "position": 3}], "track_record_open": {"name": "Mitch Thompson", "time": "1,27.46 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "1,37.49 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "1,35.78 (set in 2019)"}}	APPROVED	\N	NEW
32	2	{"name": "La Violenta 2019", "date_from": "2019-08-23", "date_to": "2019-08-25", "location": "la rioja argentina", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-violenta-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Esneider Osorno", "position": 3}], "top_riders_luge": [{"name": "Lucas Bailon", "position": 1}, {"name": "Ramallo Augusto", "position": 2}, {"name": "Roberto Rengifo", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Vanessa Curra", "position": 2}, {"name": "Antonella Olivera", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
33	2	{"name": "La Leonera DH 2019", "date_from": "2019-09-08", "date_to": "2019-11-08", "location": "La Leonera", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-leonera-dh-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Chase Hiller", "position": 2}, {"name": "Morgan Owens", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Jennifer Butler", "position": 2}, {"name": "Kevin Guevara", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Laura Vargas", "position": 3}], "track_record_open": {"name": "Harry Clarke", "time": "2,11.34 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "2,26.21 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "2,22.44 (set in 2019)"}}	APPROVED	\N	NEW
29	2	{"name": "Yaku Raymi 2019", "date_from": "2019-09-13", "date_to": "2019-09-15", "location": "Huallin", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/yaku-raymi-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
37	2	{"name": "Transylvania DH 2019", "date_from": "2019-07-26", "date_to": "2019-07-28", "location": "Vulcan", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/transylvania-dh-2019/"}], "top_riders_open": [{"name": "Chase Hiller", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Pearse d\\u2019Arcy", "position": 3}], "top_riders_luge": [{"name": "Olivier Gerling", "position": 1}, {"name": "Ulrich Becker", "position": 2}, {"name": "Andrej Ilic", "position": 3}], "top_riders_woman": [{"name": "Lisa Peters", "position": 1}, {"name": "Feiyane Ruegg", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": {"name": "Chase Hiller", "time": "2,13.75 (set in 2019)"}, "track_record_luge": {"name": "Ulrich Becker", "time": "2,16.28 (set in 2019)"}, "track_record_woman": {"name": "Lisa Peters", "time": "2,33.9 (set in 2019)"}}	APPROVED	\N	NEW
34	2	{"name": "Kozakov Challenge 2019", "date_from": "2019-07-17", "date_to": "2019-07-20", "location": "Kozakov", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/kozakov-challenge-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Ryan Farmer", "position": 1}, {"name": "Mikel Echegaray-Diez", "position": 2}, {"name": "Abdil Mahdzan", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Grace Wong", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
35	2	{"name": "Gravity Fest 2019", "date_from": "2019-01-06", "date_to": "2019-02-06", "location": "Munnsville", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/gravity-fest-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Diego Poncelet", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Tim Koch", "position": 1}, {"name": "Ira Hewton", "position": 2}, {"name": "Yan Triponez", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Ashley Winecoff", "position": 2}, {"name": "Teresa Gillcrist", "position": 3}], "track_record_open": {"name": "Nicholas Broms", "time": "1,46.830 (set in 2018)"}, "track_record_luge": {"name": "Kolby Parks", "time": "1,45.15 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,47.510 (set in 2018)"}}	APPROVED	\N	NEW
38	2	{"name": "Killington 2019", "date_from": "2019-06-14", "date_to": "2019-06-16", "location": "Killington", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/killington-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Emily Pross", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Tim Koch", "position": 2}, {"name": "Olivier Filiatrault", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}], "track_record_open": {"name": "Oscar Rodriguez Escoin", "time": "1,53.69 (set in 2018)"}, "track_record_luge": {"name": "Frank Williams", "time": "1,51.35 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,55.55 (set in 2017)"}}	APPROVED	\N	NEW
39	2	{"name": "Tame the Taipan 2019", "date_from": "2019-12-04", "date_to": "2019-04-14", "location": "Gold Coast", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/tame-the-taipan-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Julian Slaney", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lea Richard", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
40	2	{"name": "Keeping It High 2019", "date_from": "2019-04-25", "date_to": "2019-04-26", "location": "Nasugbu", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/keeping-it-high-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": {"name": "Harry Clarke", "time": "1,38.250 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,38.550 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,40.900 (set in 2019)"}}	APPROVED	\N	NEW
41	2	{"name": "Verdicchio Race 2019", "date_from": "2019-10-07", "date_to": "2019-07-13", "location": "Poggiocupro", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/verdicchio-race-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Dane Hanna", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Jennifer Schauerte", "position": 3}], "track_record_open": {"name": "Nicholas Broms", "time": "2,18.19 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "2,17.53 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "2,20.39 (set in 2018)"}}	APPROVED	\N	NEW
79	2	{"name": "La Violenta 2019", "date_from": "2019-08-23", "date_to": "2019-08-25", "location": "la rioja argentina", "lat": -29.7824554, "lng": -67.1147124, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-violenta-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Esneider Osorno", "position": 3}], "top_riders_luge": [{"name": "Lucas Bailon", "position": 1}, {"name": "Ramallo Augusto", "position": 2}, {"name": "Roberto Rengifo", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Vanessa Curra", "position": 2}, {"name": "Antonella Olivera", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
36	2	{"name": "Seaside 2019", "date_from": "2019-04-22", "date_to": "2019-04-23", "location": "Cavite", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/seaside-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Mitch Thompson", "position": 2}, {"name": "Andrew Atchison", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": {"name": "Mitch Thompson", "time": "1,26.98 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,27.550 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,28.570 (set in 2018)"}}	APPROVED	\N	NEW
42	1	{"name": "Test Race 1", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Prague", "lat": 50.0874654, "lng": 14.4212535, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example1.com"}], "top_riders_open": [{"name": "John Doe", "position": 1}, {"name": "Alice Brown", "position": 2}, {"name": "Eve Davis", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
43	1	{"name": "Test Race 2", "date_from": "2024-02-20", "date_to": "2024-02-21", "location": "Kozakov", "lat": 50.5942645, "lng": 15.2636614, "category": "IDF", "links": [{"name": "Event Page", "url": "https://example2.com"}], "top_riders_open": [{"name": "Jane Smith", "position": 1}, {"name": "Charlie Wilson", "position": 2}, {"name": "Frank Miller", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
44	1	{"name": "Test Race 3", "date_from": "2024-03-10", "date_to": "2024-03-11", "location": "Maryhill", "lat": 55.8871256, "lng": -4.2863706, "category": "EURO", "links": [{"name": "Event Page", "url": "https://example3.com"}], "top_riders_open": [{"name": "Bob Johnson", "position": 1}, {"name": "Diana Lee", "position": 2}, {"name": "Grace Taylor", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
45	2	{"name": "Yaku Raymi 2019", "date_from": "2019-09-13", "date_to": "2019-09-15", "location": "Huallin", "lat": -9.1805842, "lng": -77.4233721, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/yaku-raymi-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
46	2	{"name": "La Violenta 2019", "date_from": "2019-08-23", "date_to": "2019-08-25", "location": "la rioja argentina", "lat": -29.9729781, "lng": -67.0487944, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-violenta-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Esneider Osorno", "position": 3}], "top_riders_luge": [{"name": "Lucas Bailon", "position": 1}, {"name": "Ramallo Augusto", "position": 2}, {"name": "Roberto Rengifo", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Vanessa Curra", "position": 2}, {"name": "Antonella Olivera", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
47	2	{"name": "La Leonera DH 2019", "date_from": "2019-09-08", "date_to": "2019-11-08", "location": "La Leonera", "lat": -36.9512437, "lng": -73.0131475, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-leonera-dh-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Chase Hiller", "position": 2}, {"name": "Morgan Owens", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Jennifer Butler", "position": 2}, {"name": "Kevin Guevara", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Laura Vargas", "position": 3}], "track_record_open": {"name": "Harry Clarke", "time": "2,11.34 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "2,26.21 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "2,22.44 (set in 2019)"}}	APPROVED	\N	NEW
48	2	{"name": "Kozakov Challenge 2019", "date_from": "2019-07-17", "date_to": "2019-07-20", "location": "Kozakov", "lat": 50.5942645, "lng": 15.2636614, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/kozakov-challenge-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Ryan Farmer", "position": 1}, {"name": "Mikel Echegaray-Diez", "position": 2}, {"name": "Abdil Mahdzan", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Grace Wong", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
49	2	{"name": "Gravity Fest 2019", "date_from": "2019-01-06", "date_to": "2019-02-06", "location": "Munnsville", "lat": 42.977013, "lng": -75.586846, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/gravity-fest-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Diego Poncelet", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Tim Koch", "position": 1}, {"name": "Ira Hewton", "position": 2}, {"name": "Yan Triponez", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Ashley Winecoff", "position": 2}, {"name": "Teresa Gillcrist", "position": 3}], "track_record_open": {"name": "Nicholas Broms", "time": "1,46.830 (set in 2018)"}, "track_record_luge": {"name": "Kolby Parks", "time": "1,45.15 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,47.510 (set in 2018)"}}	APPROVED	\N	NEW
109	2	{"name": "tina 2", "date_from": "2025-10-20", "date_to": null, "location": null, "lat": 50.527735857020645, "lng": 14.162843327366403, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Tina", "position": 1}], "top_riders_luge": [{"name": "Tina", "position": 1}, {"name": "Tina", "position": 2}, {"name": "Tina", "position": 3}], "top_riders_woman": [{"name": "Tina", "position": 1}, {"name": "Tina", "position": 2}, {"name": "Tina", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
50	2	{"name": "Seaside 2019", "date_from": "2019-04-22", "date_to": "2019-04-23", "location": "Cavite", "lat": 14.2554073, "lng": 120.8671503, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/seaside-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Mitch Thompson", "position": 2}, {"name": "Andrew Atchison", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": {"name": "Mitch Thompson", "time": "1,26.98 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,27.550 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,28.570 (set in 2018)"}}	APPROVED	\N	NEW
51	2	{"name": "Transylvania DH 2019", "date_from": "2019-07-26", "date_to": "2019-07-28", "location": "Vulcan", "lat": 45.3748642, "lng": 23.2940874, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/transylvania-dh-2019/"}], "top_riders_open": [{"name": "Chase Hiller", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Pearse d\\u2019Arcy", "position": 3}], "top_riders_luge": [{"name": "Olivier Gerling", "position": 1}, {"name": "Ulrich Becker", "position": 2}, {"name": "Andrej Ilic", "position": 3}], "top_riders_woman": [{"name": "Lisa Peters", "position": 1}, {"name": "Feiyane Ruegg", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": {"name": "Chase Hiller", "time": "2,13.75 (set in 2019)"}, "track_record_luge": {"name": "Ulrich Becker", "time": "2,16.28 (set in 2019)"}, "track_record_woman": {"name": "Lisa Peters", "time": "2,33.9 (set in 2019)"}}	APPROVED	\N	NEW
52	2	{"name": "Killington 2019", "date_from": "2019-06-14", "date_to": "2019-06-16", "location": "Killington", "lat": 43.67433, "lng": -72.7784445, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/killington-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Emily Pross", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Tim Koch", "position": 2}, {"name": "Olivier Filiatrault", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}], "track_record_open": {"name": "Oscar Rodriguez Escoin", "time": "1,53.69 (set in 2018)"}, "track_record_luge": {"name": "Frank Williams", "time": "1,51.35 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,55.55 (set in 2017)"}}	APPROVED	\N	NEW
53	2	{"name": "Tame the Taipan 2019", "date_from": "2019-12-04", "date_to": "2019-04-14", "location": "Gold Coast", "lat": -28.0023731, "lng": 153.4145987, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/tame-the-taipan-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Julian Slaney", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lea Richard", "position": 2}, {"name": "Elissa Mah", "position": 3}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
54	2	{"name": "Keeping It High 2019", "date_from": "2019-04-25", "date_to": "2019-04-26", "location": "Nasugbu", "lat": 14.0736258, "lng": 120.6320724, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/keeping-it-high-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "track_record_open": {"name": "Harry Clarke", "time": "1,38.250 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,38.550 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,40.900 (set in 2019)"}}	APPROVED	\N	NEW
55	2	{"name": "Verdicchio Race 2019", "date_from": "2019-10-07", "date_to": "2019-07-13", "location": "Poggiocupro", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/verdicchio-race-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Dane Hanna", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Jennifer Schauerte", "position": 3}], "track_record_open": {"name": "Nicholas Broms", "time": "2,18.19 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "2,17.53 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "2,20.39 (set in 2018)"}}	APPROVED	\N	NEW
56	1	{"name": "Test Race with Qualifiers", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Prague", "lat": 50.0874654, "lng": 14.4212535, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example.com"}], "top_riders_open": [{"name": "John Doe", "position": 1}, {"name": "Jane Smith", "position": 2}, {"name": "Bob Johnson", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "Alice Brown", "position": 1}, {"name": "Charlie Wilson", "position": 2}, {"name": "Diana Lee", "position": 3}, {"name": "Eve Davis", "position": 4}, {"name": "Frank Miller", "position": 5}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
57	1	{"name": "Test Race with Qualifiers v2", "date_from": "2024-01-20", "date_to": "2024-01-21", "location": "Prague", "lat": 50.0874654, "lng": 14.4212535, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example.com"}], "top_riders_open": [{"name": "Winner", "position": 1}, {"name": "Second", "position": 2}, {"name": "Third", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "Qualifier 1", "position": 1}, {"name": "Qualifier 2", "position": 2}, {"name": "Qualifier 3", "position": 3}, {"name": "Qualifier 4", "position": 4}, {"name": "Qualifier 5", "position": 5}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
59	1	{"name": "Test Spot", "date_from": "2024-01-20", "date_to": null, "location": "Prague", "lat": 50.0874654, "lng": 14.4212535, "category": "SPOT", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
110	2	{"name": "Tina", "date_from": "2025-09-30", "date_to": null, "location": "Unknown", "lat": 50.6227114, "lng": 12.5261199, "category": "EURO", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [{"name": "Tina", "position": 1}, {"name": "Tina", "position": 2}, {"name": "Tina", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "organizer_name": null, "is_edit": true, "editing_event_id": 99}	APPROVED	\N	EDIT
61	2	{"name": "Yaku Raymi 2019", "date_from": "2019-09-13", "date_to": "2019-09-15", "location": "Huallin", "lat": -9.1805842, "lng": -77.4233721, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/yaku-raymi-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
62	2	{"name": "Newton\\u2019s 2019", "date_from": "2019-05-04", "date_to": "2019-07-04", "location": "Bathurst", "lat": 13.45535, "lng": -16.575646, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/newtons-2019/"}], "top_riders_open": [{"name": "Mitch Thompson", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Daina Banks", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
63	2	{"name": "La Virgen 2019", "date_from": "2019-02-08", "date_to": "2019-03-08", "location": "Cali", "lat": 3.4108435, "lng": -76.5812127, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-virgen-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Morgan Owens", "position": 2}, {"name": "Joshua Evans", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Kevin Guevara", "position": 2}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Sirley Tabares", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Mitch Thompson", "time": "1,27.46 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "1,37.49 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "1,35.78 (set in 2019)"}}	APPROVED	\N	NEW
64	2	{"name": "La Violenta 2019", "date_from": "2019-08-23", "date_to": "2019-08-25", "location": "la rioja argentina", "lat": -29.9729781, "lng": -67.0487944, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-violenta-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Esneider Osorno", "position": 3}], "top_riders_luge": [{"name": "Lucas Bailon", "position": 1}, {"name": "Ramallo Augusto", "position": 2}, {"name": "Roberto Rengifo", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Vanessa Curra", "position": 2}, {"name": "Antonella Olivera", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
65	2	{"name": "La Leonera DH 2019", "date_from": "2019-09-08", "date_to": "2019-11-08", "location": "La Leonera", "lat": -36.9512437, "lng": -73.0131475, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-leonera-dh-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Chase Hiller", "position": 2}, {"name": "Morgan Owens", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Jennifer Butler", "position": 2}, {"name": "Kevin Guevara", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Laura Vargas", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Harry Clarke", "time": "2,11.34 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "2,26.21 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "2,22.44 (set in 2019)"}}	APPROVED	\N	NEW
67	2	{"name": "Gravity Fest 2019", "date_from": "2019-01-06", "date_to": "2019-02-06", "location": "Munnsville", "lat": 42.977013, "lng": -75.586846, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/gravity-fest-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Diego Poncelet", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Tim Koch", "position": 1}, {"name": "Ira Hewton", "position": 2}, {"name": "Yan Triponez", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Ashley Winecoff", "position": 2}, {"name": "Teresa Gillcrist", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Nicholas Broms", "time": "1,46.830 (set in 2018)"}, "track_record_luge": {"name": "Kolby Parks", "time": "1,45.15 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,47.510 (set in 2018)"}}	APPROVED	\N	NEW
111	2	{"name": "newrace", "date_from": "2025-10-18", "date_to": null, "location": "Unknown", "lat": 49.783937939131505, "lng": 13.396228445380359, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Mario", "position": 2}, {"name": "Luigi", "position": 3}, {"name": "Bryce", "position": 4}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "None", "position": 1}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "organizer_name": null, "is_edit": true, "editing_event_id": 93}	APPROVED	\N	EDIT
60	2	{"name": "Tour de Maryhill 2019", "date_from": "2019-08-30", "date_to": "2019-01-09", "location": "Goldendale", "lat": 45.8206794, "lng": -120.821731, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/maryhill-gp-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Dane Hanna", "position": 3}], "top_riders_luge": [{"name": "Mikel Echegaray Diez", "position": 1}, {"name": "Ryan Farmer", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Nashley Alameda", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Dane Hanna", "time": "3,01.03 (set in 2019)"}, "track_record_luge": {"name": "Ryan Farmer", "time": "2,57.53 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "3,03.82 (set in 2019)"}}	APPROVED	\N	NEW
66	2	{"name": "Kozakov Challenge 2019", "date_from": "2019-07-17", "date_to": "2019-07-20", "location": "Kozakov", "lat": 50.5942645, "lng": 15.2636614, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/kozakov-challenge-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Ryan Farmer", "position": 1}, {"name": "Mikel Echegaray-Diez", "position": 2}, {"name": "Abdil Mahdzan", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Grace Wong", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
69	2	{"name": "Transylvania DH 2019", "date_from": "2019-07-26", "date_to": "2019-07-28", "location": "Vulcan", "lat": 45.3748642, "lng": 23.2940874, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/transylvania-dh-2019/"}], "top_riders_open": [{"name": "Chase Hiller", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Pearse d\\u2019Arcy", "position": 3}], "top_riders_luge": [{"name": "Olivier Gerling", "position": 1}, {"name": "Ulrich Becker", "position": 2}, {"name": "Andrej Ilic", "position": 3}], "top_riders_woman": [{"name": "Lisa Peters", "position": 1}, {"name": "Feiyane Ruegg", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Chase Hiller", "time": "2,13.75 (set in 2019)"}, "track_record_luge": {"name": "Ulrich Becker", "time": "2,16.28 (set in 2019)"}, "track_record_woman": {"name": "Lisa Peters", "time": "2,33.9 (set in 2019)"}}	APPROVED	\N	NEW
70	2	{"name": "Killington 2019", "date_from": "2019-06-14", "date_to": "2019-06-16", "location": "Killington", "lat": 43.67433, "lng": -72.7784445, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/killington-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Emily Pross", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Tim Koch", "position": 2}, {"name": "Olivier Filiatrault", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}], "top_qualifiers": [], "track_record_open": {"name": "Oscar Rodriguez Escoin", "time": "1,53.69 (set in 2018)"}, "track_record_luge": {"name": "Frank Williams", "time": "1,51.35 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,55.55 (set in 2017)"}}	APPROVED	\N	NEW
71	2	{"name": "Tame the Taipan 2019", "date_from": "2019-12-04", "date_to": "2019-04-14", "location": "Gold Coast", "lat": -28.0023731, "lng": 153.4145987, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/tame-the-taipan-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Julian Slaney", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lea Richard", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
72	2	{"name": "Keeping It High 2019", "date_from": "2019-04-25", "date_to": "2019-04-26", "location": "Nasugbu", "lat": 14.0736258, "lng": 120.6320724, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/keeping-it-high-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": {"name": "Harry Clarke", "time": "1,38.250 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,38.550 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,40.900 (set in 2019)"}}	APPROVED	\N	NEW
112	2	{"name": "newrace", "date_from": "2025-10-18", "date_to": null, "location": "Unknown", "lat": 49.783937939131505, "lng": 13.396228445380359, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Mario", "position": 2}, {"name": "Luigi", "position": 3}, {"name": "Bryce", "position": 4}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "None", "position": 1}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "organizer_name": "pearce d'arcy", "is_edit": true, "editing_event_id": 93}	APPROVED	\N	EDIT
68	2	{"name": "Seaside 2019", "date_from": "2019-04-22", "date_to": "2019-04-23", "location": "Cavite", "lat": 14.2554073, "lng": 120.8671503, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/seaside-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Mitch Thompson", "position": 2}, {"name": "Andrew Atchison", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Mitch Thompson", "time": "1,26.98 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,27.550 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,28.570 (set in 2018)"}}	APPROVED	\N	NEW
73	2	{"name": "Verdicchio Race 2019", "date_from": "2019-10-07", "date_to": "2019-07-13", "location": "Poggiocupro", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/verdicchio-race-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Dane Hanna", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Jennifer Schauerte", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Nicholas Broms", "time": "2,18.19 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "2,17.53 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "2,20.39 (set in 2018)"}}	APPROVED	\N	NEW
74	1	{"name": "Test All Categories Event", "date_from": "2024-01-15", "date_to": null, "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Open Winner", "position": 1}, {"name": "Open Second", "position": 2}, {"name": "Open Third", "position": 3}], "top_riders_luge": [{"name": "Luge Winner", "position": 1}, {"name": "Luge Second", "position": 2}, {"name": "Luge Third", "position": 3}], "top_riders_woman": [{"name": "Women Winner", "position": 1}, {"name": "Women Second", "position": 2}, {"name": "Women Third", "position": 3}], "top_qualifiers": [{"name": "Qualifier 1", "position": 1}, {"name": "Qualifier 2", "position": 2}], "track_record_open": {"name": "Track Record Holder", "time": "1:23.45"}, "track_record_luge": {"name": "Luge Record Holder", "time": "1:20.30"}, "track_record_woman": {"name": "Women Record Holder", "time": "1:25.15"}}	APPROVED	\N	NEW
75	2	{"name": "Tour de Maryhill 2019", "date_from": "2019-08-30", "date_to": "2019-01-09", "location": "Goldendale", "lat": 45.8206794, "lng": -120.821731, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/maryhill-gp-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Dane Hanna", "position": 3}], "top_riders_luge": [{"name": "Mikel Echegaray Diez", "position": 1}, {"name": "Ryan Farmer", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Nashley Alameda", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Dane Hanna", "time": "3,01.03 (set in 2019)"}, "track_record_luge": {"name": "Ryan Farmer", "time": "2,57.53 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "3,03.82 (set in 2019)"}}	APPROVED	\N	NEW
76	2	{"name": "Yaku Raymi 2019", "date_from": "2019-09-13", "date_to": "2019-09-15", "location": "Huallin", "lat": -9.1805842, "lng": -77.4233721, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/yaku-raymi-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
77	2	{"name": "Newton\\u2019s 2019", "date_from": "2019-05-04", "date_to": "2019-07-04", "location": "Bathurst", "lat": 13.45535, "lng": -16.575646, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/newtons-2019/"}], "top_riders_open": [{"name": "Mitch Thompson", "position": 1}, {"name": "Maxwell Capps", "position": 2}, {"name": "Daina Banks", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Kolby Parks", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
78	2	{"name": "La Virgen 2019", "date_from": "2019-02-08", "date_to": "2019-03-08", "location": "Cali", "lat": 3.4108435, "lng": -76.5812127, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-virgen-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Morgan Owens", "position": 2}, {"name": "Joshua Evans", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Kevin Guevara", "position": 2}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Sirley Tabares", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Mitch Thompson", "time": "1,27.46 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "1,37.49 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "1,35.78 (set in 2019)"}}	APPROVED	\N	NEW
113	2	{"name": "fsdaf", "date_from": "2025-10-24", "date_to": null, "location": null, "lat": 50.08804, "lng": 14.42076, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "organizer_name": "", "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
81	2	{"name": "Kozakov Challenge 2019", "date_from": "2019-07-17", "date_to": "2019-07-20", "location": "Kozakov", "lat": 50.5942645, "lng": 15.2636614, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/kozakov-challenge-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Ryan Farmer", "position": 1}, {"name": "Mikel Echegaray-Diez", "position": 2}, {"name": "Abdil Mahdzan", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Grace Wong", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
83	2	{"name": "Seaside 2019", "date_from": "2019-04-22", "date_to": "2019-04-23", "location": "Cavite", "lat": 14.2554073, "lng": 120.8671503, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/seaside-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Mitch Thompson", "position": 2}, {"name": "Andrew Atchison", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Teresa Gillcrist", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Mitch Thompson", "time": "1,26.98 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,27.550 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,28.570 (set in 2018)"}}	APPROVED	\N	NEW
84	2	{"name": "Transylvania DH 2019", "date_from": "2019-07-26", "date_to": "2019-07-28", "location": "Vulcan", "lat": 45.3748642, "lng": 23.2940874, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/transylvania-dh-2019/"}], "top_riders_open": [{"name": "Chase Hiller", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Pearse d\\u2019Arcy", "position": 3}], "top_riders_luge": [{"name": "Olivier Gerling", "position": 1}, {"name": "Ulrich Becker", "position": 2}, {"name": "Andrej Ilic", "position": 3}], "top_riders_woman": [{"name": "Lisa Peters", "position": 1}, {"name": "Feiyane Ruegg", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Chase Hiller", "time": "2,13.75 (set in 2019)"}, "track_record_luge": {"name": "Ulrich Becker", "time": "2,16.28 (set in 2019)"}, "track_record_woman": {"name": "Lisa Peters", "time": "2,33.9 (set in 2019)"}}	APPROVED	\N	NEW
85	2	{"name": "Killington 2019", "date_from": "2019-06-14", "date_to": "2019-06-16", "location": "Killington", "lat": 43.67433, "lng": -72.7784445, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/killington-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Daina Banks", "position": 2}, {"name": "Emily Pross", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Tim Koch", "position": 2}, {"name": "Olivier Filiatrault", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}], "top_qualifiers": [], "track_record_open": {"name": "Oscar Rodriguez Escoin", "time": "1,53.69 (set in 2018)"}, "track_record_luge": {"name": "Frank Williams", "time": "1,51.35 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,55.55 (set in 2017)"}}	APPROVED	\N	NEW
86	2	{"name": "Tame the Taipan 2019", "date_from": "2019-12-04", "date_to": "2019-04-14", "location": "Gold Coast", "lat": -28.0023731, "lng": 153.4145987, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/tame-the-taipan-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Kolby Parks", "position": 1}, {"name": "Graham Brittain", "position": 2}, {"name": "Julian Slaney", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lea Richard", "position": 2}, {"name": "Elissa Mah", "position": 3}], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
87	2	{"name": "Keeping It High 2019", "date_from": "2019-04-25", "date_to": "2019-04-26", "location": "Nasugbu", "lat": 14.0736258, "lng": 120.6320724, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/keeping-it-high-2019/"}], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": {"name": "Harry Clarke", "time": "1,38.250 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "1,38.550 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,40.900 (set in 2019)"}}	APPROVED	\N	NEW
80	2	{"name": "La Leonera DH 2019", "date_from": "2019-09-08", "date_to": "2019-11-08", "location": "La Leonera", "lat": -36.9512437, "lng": -73.0131475, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/la-leonera-dh-2019/"}], "top_riders_open": [{"name": "Harry Clarke", "position": 1}, {"name": "Chase Hiller", "position": 2}, {"name": "Morgan Owens", "position": 3}], "top_riders_luge": [{"name": "Roberto Rengifo", "position": 1}, {"name": "Jennifer Butler", "position": 2}, {"name": "Kevin Guevara", "position": 3}], "top_riders_woman": [{"name": "Sabrina Ambrosi", "position": 1}, {"name": "Angie Duque", "position": 2}, {"name": "Laura Vargas", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Harry Clarke", "time": "2,11.34 (set in 2019)"}, "track_record_luge": {"name": "Roberto Elias Leiva Rengifo", "time": "2,26.21 (set in 2019)"}, "track_record_woman": {"name": "Sabrina Ambrosi", "time": "2,22.44 (set in 2019)"}}	APPROVED	\N	NEW
82	2	{"name": "Gravity Fest 2019", "date_from": "2019-01-06", "date_to": "2019-02-06", "location": "Munnsville", "lat": 42.977013, "lng": -75.586846, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/gravity-fest-2019/"}], "top_riders_open": [{"name": "Dane Hanna", "position": 1}, {"name": "Diego Poncelet", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Tim Koch", "position": 1}, {"name": "Ira Hewton", "position": 2}, {"name": "Yan Triponez", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Ashley Winecoff", "position": 2}, {"name": "Teresa Gillcrist", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Nicholas Broms", "time": "1,46.830 (set in 2018)"}, "track_record_luge": {"name": "Kolby Parks", "time": "1,45.15 (set in 2019)"}, "track_record_woman": {"name": "Emily Pross", "time": "1,47.510 (set in 2018)"}}	APPROVED	\N	NEW
88	2	{"name": "Verdicchio Race 2019", "date_from": "2019-10-07", "date_to": "2019-07-13", "location": "Poggiocupro", "lat": 0.0, "lng": 0.0, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/verdicchio-race-2019/"}], "top_riders_open": [{"name": "Nicholas Broms", "position": 1}, {"name": "Dane Hanna", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Abdil Mahdzan", "position": 1}, {"name": "Olivier Gerling", "position": 2}, {"name": "Ulrich Becker", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Jennifer Schauerte", "position": 3}], "top_qualifiers": [], "track_record_open": {"name": "Nicholas Broms", "time": "2,18.19 (set in 2019)"}, "track_record_luge": {"name": "Abdil Mahdzan", "time": "2,17.53 (set in 2018)"}, "track_record_woman": {"name": "Emily Pross", "time": "2,20.39 (set in 2018)"}}	APPROVED	\N	NEW
89	1	{"name": "Test Many Qualifiers Event", "date_from": "2024-01-15", "date_to": null, "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Open Winner", "position": 1}, {"name": "Open Second", "position": 2}, {"name": "Open Third", "position": 3}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "Qualifier 1", "position": 1}, {"name": "Qualifier 2", "position": 2}, {"name": "Qualifier 3", "position": 3}, {"name": "Qualifier 4", "position": 4}, {"name": "Qualifier 5", "position": 5}, {"name": "Qualifier 6", "position": 6}, {"name": "Qualifier 7", "position": 7}, {"name": "Qualifier 8", "position": 8}, {"name": "Qualifier 9", "position": 9}, {"name": "Qualifier 10", "position": 10}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
103	2	{"name": "Kozakov Challenge 2019", "date_from": "2019-07-16", "date_to": "2019-07-19", "location": "Kozakov", "lat": 50.5942645, "lng": 15.2636614, "category": "IDF", "links": [{"name": "Event Page", "url": "https://internationaldownhillfederation.org/races/kozakov-challenge-2019/"}], "top_riders_open": [{"name": "Daina Banks", "position": 1}, {"name": "Harry Clarke", "position": 2}, {"name": "Chase Hiller", "position": 3}], "top_riders_luge": [{"name": "Ryan Farmer", "position": 1}, {"name": "Mikel Echegaray Diez", "position": 2}, {"name": "Abdil Mahdzan", "position": 3}], "top_riders_woman": [{"name": "Emily Pross", "position": 1}, {"name": "Lisa Peters", "position": 2}, {"name": "Grace Wong", "position": 3}], "top_qualifiers": [{"name": "Diego Poncelet", "position": 1}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": true, "editing_event_id": 80}	APPROVED	\N	EDIT
104	2	{"name": "Izoard", "date_from": "2025-10-20", "date_to": null, "location": null, "lat": 44.7599342, "lng": 2.5398923, "category": "SPOT", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
107	2	{"name": "newrace", "date_from": "2025-10-19", "date_to": null, "location": "Unknown", "lat": 49.783937939131505, "lng": 13.396228445380359, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Mario", "position": 2}, {"name": "Luigi", "position": 3}, {"name": "Bruce", "position": 4}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": true, "editing_event_id": 93}	APPROVED	\N	EDIT
90	1	{"name": "Admin Test Event - All Categories", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Test Location for Admin", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example.com/event"}, {"name": "Results", "url": "https://example.com/results"}], "top_riders_open": [{"name": "Open Winner", "position": 1}, {"name": "Open Second", "position": 2}, {"name": "Open Third", "position": 3}], "top_riders_luge": [{"name": "Luge Winner", "position": 1}, {"name": "Luge Second", "position": 2}], "top_riders_woman": [{"name": "Women Winner", "position": 1}, {"name": "Women Second", "position": 2}, {"name": "Women Third", "position": 3}], "top_qualifiers": [{"name": "Qualifier 1", "position": 1}, {"name": "Qualifier 2", "position": 2}, {"name": "Qualifier 3", "position": 3}, {"name": "Qualifier 4", "position": 4}], "track_record_open": {"name": "Track Record Holder", "time": "1:23.45"}, "track_record_luge": {"name": "Luge Record Holder", "time": "1:20.30"}, "track_record_woman": {"name": "Women Record Holder", "time": "1:25.15"}}	APPROVED	\N	NEW
92	2	{"name": "Monteciano", "date_from": "2025-08-05", "date_to": "2025-08-07", "location": null, "lat": 43.3152044152736, "lng": 12.175108740312965, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Emily", "position": 2}, {"name": "Greg", "position": 3}], "top_riders_luge": [{"name": "Allah", "position": 1}, {"name": "Houston", "position": 2}, {"name": "Emilia", "position": 3}, {"name": "Diego Poncelet", "position": 4}], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
93	2	{"name": "montenegro", "date_from": "2025-10-20", "date_to": null, "location": null, "lat": 50.352803027830134, "lng": 15.417748139568346, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null}	APPROVED	\N	NEW
101	1	{"name": "Complete Test Event", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example.com/event"}], "top_riders_open": [{"name": "Open Winner", "position": 1}, {"name": "Open Second", "position": 2}], "top_riders_luge": [{"name": "Luge Winner", "position": 1}], "top_riders_woman": [{"name": "Women Winner", "position": 1}], "top_qualifiers": [{"name": "Qualifier 1", "position": 1}, {"name": "Qualifier 2", "position": 2}], "track_record_open": {"name": "Track Record Holder", "time": "1:23.45"}, "track_record_luge": {"name": "Luge Record Holder", "time": "1:20.30"}, "track_record_woman": {"name": "Women Record Holder", "time": "1:25.15"}, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
97	2	{"name": "newrace", "date_from": "2025-10-20", "date_to": null, "location": null, "lat": 49.783937939131505, "lng": 13.396228445380359, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Mario", "position": 2}, {"name": "Luigi", "position": 3}, {"name": "Prince", "position": 4}], "top_riders_luge": [{"name": "Fik", "position": 1}], "top_riders_woman": [], "top_qualifiers": [{"name": "None", "position": 1}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "_uploaded_image_url": "/static/uploads/events/97_369a9e57.png"}	APPROVED	\N	NEW
96	1	{"name": "Fixed Image Test", "date_from": "2024-01-15", "date_to": null, "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "_uploaded_image_url": "/static/uploads/events/96_5c2fc9a9.jpg"}	APPROVED	\N	NEW
98	1	{"name": "Test Edit Event", "date_from": "2024-01-15", "date_to": null, "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": true, "editing_event_id": 92}	APPROVED	\N	EDIT
99	1	{"name": "Original Test Event", "date_from": "2024-01-15", "date_to": null, "location": "Original Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
102	1	{"name": "Incomplete Test Event", "date_from": "2024-01-15", "date_to": null, "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [], "top_riders_open": [], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
100	1	{"name": "Updated Test Event", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Updated Location", "lat": 51.0, "lng": 15.0, "category": "EURO", "links": [{"name": "Event Page", "url": "https://example.com/updated"}], "top_riders_open": [{"name": "Winner", "position": 1}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": {"name": "Record Holder", "time": "1:23.45"}, "track_record_luge": null, "track_record_woman": null, "is_edit": true, "editing_event_id": 94}	APPROVED	\N	EDIT
106	2	{"name": "newrace", "date_from": "2025-10-19", "date_to": null, "location": "Unknown", "lat": 49.783937939131505, "lng": 13.396228445380359, "category": "WDSC", "links": [], "top_riders_open": [{"name": "Diego", "position": 1}, {"name": "Mario", "position": 2}, {"name": "Luigi", "position": 3}, {"name": "Bryce", "position": 4}], "top_riders_luge": [], "top_riders_woman": [], "top_qualifiers": [{"name": "None", "position": 1}], "track_record_open": null, "track_record_luge": null, "track_record_woman": null, "is_edit": true, "editing_event_id": 93}	APPROVED	\N	EDIT
105	1	{"name": "Pending Test Event", "date_from": "2024-01-15", "date_to": "2024-01-16", "location": "Test Location", "lat": 50.0, "lng": 14.0, "category": "WDSC", "links": [{"name": "Event Page", "url": "https://example.com/event"}], "top_riders_open": [{"name": "Pending Winner", "position": 1}, {"name": "Pending Second", "position": 2}], "top_riders_luge": [{"name": "Pending Luge Winner", "position": 1}], "top_riders_woman": [], "top_qualifiers": [], "track_record_open": {"name": "Pending Record Holder", "time": "1:23.45"}, "track_record_luge": null, "track_record_woman": null, "is_edit": false, "editing_event_id": null}	APPROVED	\N	NEW
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password_hash, role, is_active, can_submit, display_name, display_name_norm, profile_image_url) FROM stdin;
1	luka@gmail.com	Lukas	$2b$12$vhsZPaG0tpycKTSxmRtNP.esThdawnUJIuBYMFArbp38u4vWLtJZG	USER	t	t	Lukas	lukas	/static/uploads/profiles/default_avatar.jpg
4	pross@gmail.com	Emily Pross	$2b$12$X9REkgkURBb4j3QszE4P9uuwaaP9ys8Yuf4hLYIc4CmVGwJ9poWDG	USER	t	t	Emily Pross	emilypross	/static/uploads/profiles/default_avatar.jpg
2	owner@gmail.com	owner	$2b$12$6Si2tTAWsYm/QtHBrlHLheayS6ba4DIN/VTfCp.f6aZTeEJsgXB7i	OWNER	t	t	owner	owner	/static/uploads/profiles/2_3f36dd1e.png
3	oxe@gmail.com	Oxe	$2b$12$GwQiju1.usa8alc5l5w6uec4KP5Ac8b1MztuASU3lWpBTdBm4/Nfi	USER	t	f	Oxe	oxe	/static/uploads/profiles/3_fbfbd367.jpg
5	hiller@gmail.com	Chase Hiller	$2b$12$2uldDWrt.q3LWjKN3Wiel.e6EuKPH2CfHecdoruDXo2NlrSWW/YdC	USER	t	t	Chase Hiller	chasehiller	/static/uploads/profiles/default_avatar.jpg
\.


--
-- Data for Name: video_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video_likes (id, video_id, user_id, created_at) FROM stdin;
3	1	2	2025-10-09 12:41:06.457168
6	6	2	2025-10-20 19:41:20.494555
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.videos (id, title, description, youtube_url, youtube_id, thumbnail_url, uploaded_by_user_id, created_at, is_active, like_count) FROM stdin;
1	Diego Shirtless		https://www.youtube.com/watch?v=aehQr7n9tXA&pp=ygUOZGllZ28gcG9uY2VsZXQ%3D	aehQr7n9tXA	https://img.youtube.com/vi/aehQr7n9tXA/maxresdefault.jpg	2	2025-10-09 12:27:08.646774	t	1
3	FULL SPEED Portugal - UPS&DOWNS Ep.6		https://youtu.be/XX7JsoX8W5s?si=4tesNSslD2B1Cj5g	XX7JsoX8W5s	https://img.youtube.com/vi/XX7JsoX8W5s/maxresdefault.jpg	2	2025-10-09 12:40:52.876456	t	0
5	Day you will NEVER FORGET!!! (Speed, Fear, freedom)		https://www.youtube.com/watch?v=tbgVGW3FT0A&t=52s	tbgVGW3FT0A	https://img.youtube.com/vi/tbgVGW3FT0A/maxresdefault.jpg	2	2025-10-09 12:47:06.883283	t	0
4	Skating Madeira Madness - UPS&DOWNS Ep.4		https://www.youtube.com/watch?v=HEvfZVXilg4	HEvfZVXilg4	https://img.youtube.com/vi/HEvfZVXilg4/maxresdefault.jpg	2	2025-10-09 12:41:50.775137	t	0
2	WET DREAMS		https://www.youtube.com/watch?v=ZyTIdhTGzQQ&pp=ygUOZGllZ28gcG9uY2VsZXQ%3D	ZyTIdhTGzQQ	https://img.youtube.com/vi/ZyTIdhTGzQQ/maxresdefault.jpg	2	2025-10-09 12:40:17.179918	t	0
6	Colombian Mountain Madness		https://www.youtube.com/watch?v=ScWouVHQFEQ	ScWouVHQFEQ	https://img.youtube.com/vi/ScWouVHQFEQ/maxresdefault.jpg	2	2025-10-20 19:41:14.441729	t	1
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: bios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bios_id_seq', 2, true);


--
-- Name: people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.people_id_seq', 159, true);


--
-- Name: race_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.race_events_id_seq', 101, true);


--
-- Name: results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.results_id_seq', 421, true);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 113, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: video_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.video_likes_id_seq', 6, true);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.videos_id_seq', 6, true);


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: postgres
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: bios bios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bios
    ADD CONSTRAINT bios_pkey PRIMARY KEY (id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: race_events race_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.race_events
    ADD CONSTRAINT race_events_pkey PRIMARY KEY (id);


--
-- Name: results results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: results uq_event_position; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT uq_event_position UNIQUE (event_id, "position");


--
-- Name: users uq_users_display_name_norm; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_display_name_norm UNIQUE (display_name_norm);


--
-- Name: video_likes uq_video_user_like; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT uq_video_user_like UNIQUE (video_id, user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_likes video_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: idx_race_events_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_race_events_geom ON public.race_events USING gist (geom);


--
-- Name: ix_bios_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_bios_user_id ON public.bios USING btree (user_id);


--
-- Name: ix_people_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_people_full_name ON public.people USING btree (full_name);


--
-- Name: ix_people_full_name_norm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_people_full_name_norm ON public.people USING btree (full_name_norm);


--
-- Name: ix_race_events_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_race_events_name ON public.race_events USING btree (name);


--
-- Name: ix_race_events_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_race_events_year ON public.race_events USING btree (year);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_video_likes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_video_likes_user_id ON public.video_likes USING btree (user_id);


--
-- Name: ix_video_likes_video_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_video_likes_video_id ON public.video_likes USING btree (video_id);


--
-- Name: ix_videos_like_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_videos_like_count ON public.videos USING btree (like_count);


--
-- Name: ix_videos_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_videos_title ON public.videos USING btree (title);


--
-- Name: ix_videos_uploaded_by_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_videos_uploaded_by_user_id ON public.videos USING btree (uploaded_by_user_id);


--
-- Name: ix_videos_youtube_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_videos_youtube_id ON public.videos USING btree (youtube_id);


--
-- Name: ix_videos_youtube_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_videos_youtube_url ON public.videos USING btree (youtube_url);


--
-- Name: bios bios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bios
    ADD CONSTRAINT bios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: results results_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.race_events(id);


--
-- Name: results results_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.results
    ADD CONSTRAINT results_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: submissions submissions_submitted_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_submitted_by_user_id_fkey FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(id);


--
-- Name: video_likes video_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_likes video_likes_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- Name: videos videos_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

