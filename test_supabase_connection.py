#!/usr/bin/env python3
"""
Test script to verify Supabase connection and data import
"""

import psycopg
import os

# Supabase connection details
DATABASE_URL = "postgresql://postgres:Ichmagbrot12und12@db.lhifiqposrdbmyyczqno.supabase.co:5432/postgres"

def test_connection():
    """Test database connection and verify data"""
    try:
        print("🔌 Testing Supabase connection...")
        
        # Connect to database
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Connected to Supabase successfully!")
        
        # Test queries
        tables_to_check = [
            ("race_events", "Race events"),
            ("users", "Users"), 
            ("people", "People"),
            ("results", "Results"),
            ("submissions", "Submissions"),
            ("bios", "Bios"),
            ("videos", "Videos"),
            ("video_likes", "Video likes")
        ]
        
        print("\n📊 Checking table data:")
        for table, description in tables_to_check:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"  {description}: {count} records")
            except Exception as e:
                print(f"  ❌ {description}: Error - {e}")
        
        # Test PostGIS
        print("\n🗺️ Testing PostGIS:")
        try:
            cur.execute("SELECT PostGIS_Version()")
            version = cur.fetchone()[0]
            print(f"  PostGIS version: {version}")
        except Exception as e:
            print(f"  ❌ PostGIS error: {e}")
        
        # Test geographic data
        print("\n🌍 Testing geographic data:")
        try:
            cur.execute("SELECT COUNT(*) FROM race_events WHERE geom IS NOT NULL")
            geo_count = cur.fetchone()[0]
            print(f"  Race events with coordinates: {geo_count}")
        except Exception as e:
            print(f"  ❌ Geographic data error: {e}")
        
        cur.close()
        conn.close()
        
        print("\n🎉 All tests completed!")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_connection()
