# 🗄️ Supabase Import Steps

## Step 1: Import Schema
1. Go to Supabase SQL Editor: https://lhifiqposrdbmyyczqno.supabase.co
2. Copy the entire contents of `database_app_schema.sql`
3. Paste into SQL Editor and click **Run**

## Step 2: Enable PostGIS Extensions
Run this in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

## Step 3: Import Data
1. Copy the entire contents of `database_app_data_inserts.sql`
2. Paste into SQL Editor and click **Run**

## Step 4: Verify Import
Run this query to check your data:
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'race_events', COUNT(*) FROM race_events
UNION ALL
SELECT 'people', COUNT(*) FROM people
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'bios', COUNT(*) FROM bios
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'video_likes', COUNT(*) FROM video_likes;
```

Expected results:
- users: 5
- race_events: 28
- people: (varies)
- results: (varies)
- submissions: (varies)
- bios: (varies)
- videos: (varies)
- video_likes: (varies)

## Step 5: Test Connection
Run the test script:
```bash
python3 test_supabase_connection.py
```

## Troubleshooting
- If you get permission errors, make sure you're using the correct database URL
- If PostGIS errors occur, the extensions might already be enabled
- If INSERT errors occur, check that the schema was imported first
