# Race History

A web app I built for downhill and longboard racing — a place to keep track of
races and spots around the world, log runs, and see results in one spot instead
of scattered across chats and spreadsheets.

I ride, so this started as something I wanted for myself and the people I skate
with. Riders could sign up, add spots and events, submit their runs and videos,
and browse what was happening elsewhere.

I've since paused it. Around the time I was building this, the r4wrun site grew
into the thing the community actually uses, so there wasn't much point competing
with it. I'm keeping the code up because I'm happy with how it came together and
it's a decent snapshot of a full app I wrote end to end.

## What's in here

- **backend/** — a FastAPI server: accounts and auth, races, events, spots,
  run submissions, videos, and an admin side for managing it all. Data lives in
  Postgres with Alembic handling the schema migrations.
- **frontend/** — the site itself, built with Next.js, React and Tailwind.
- One part I enjoyed writing is `backend/app/core/racebox_parser.py`, which reads
  the GPS track a RaceBox device logs (speed, position, g-force) so a run's speed
  and timing come straight from the track rather than being typed in by hand.

It was deployed on Railway while it was live.

## Running it

Backend:

```sh
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in your own database + JWT values
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```sh
cd frontend
npm install
npm run dev
```

Nothing sensitive is committed — the backend reads its config from the
environment (see `backend/.env.example`).
