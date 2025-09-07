from sqlalchemy import text
from app.core.db import engine

SQL = """
INSERT INTO race_events (name, year, location, lat, lng, geom, source_url)
VALUES
    ('Prague DH Classic', 2025, 'Prague, CZ', 50.08804, 14.42076,
        ST_SetSRID(ST_MakePoint(14.42076, 50.08804),4326)::geography,
        'https://example.com/prague'),
    ('Kozakov Challenge', 2025, 'Kozakov, CZ', 50.5865, 15.2824,
        ST_SetSRID(ST_MakePoint(15.2824, 50.5865),4326)::geography,
        'https://example.com/kozakov')
ON CONFLICT DO NOTHING;
"""

def main():
    with engine.begin() as conn:
        conn.execute(text(SQL))
    print("✅ Seed data inserted!")

if __name__ == "__main__":
    main()
