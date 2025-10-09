How to run:

in /infra
docker compose up -d

in /backend
uvicorn app.main:app --reload

in /frontend
npm run dev