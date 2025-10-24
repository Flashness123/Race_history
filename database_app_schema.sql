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

SET default_tablespace = '';

SET default_table_access_method = heap;

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

