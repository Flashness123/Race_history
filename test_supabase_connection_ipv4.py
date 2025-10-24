#!/usr/bin/env python3
"""
Test script to verify Supabase connection with IPv4 workarounds
"""

import psycopg
import os
import socket

# Try different connection approaches for IPv6-only networks
CONNECTION_STRINGS = [
    # Original connection string
    "postgresql://postgres:Ichmagbrot12und12@db.lhifiqposrdbmyyczqno.supabase.co:5432/postgres",
    
    # Connection pooler (port 6543) - often has better IPv4 support
    "postgresql://postgres:Ichmagbrot12und12@db.lhifiqposrdbmyyczqno.supabase.co:6543/postgres",
    
    # Try with explicit IPv4 preference
    "postgresql://postgres:Ichmagbrot12und12@db.lhifiqposrdbmyyczqno.supabase.co:5432/postgres?options=-c%20default_transaction_isolation%3Dread%20committed",
]

def test_ipv4_resolution():
    """Test if we can resolve IPv4 addresses"""
    print("🔍 Testing IPv4 resolution...")
    
    try:
        # Try to get IPv4 address
        ipv4_addresses = socket.getaddrinfo(
            "db.lhifiqposrdbmyyczqno.supabase.co", 
            5432, 
            socket.AF_INET
        )
        print(f"✅ Found IPv4 addresses: {[addr[4][0] for addr in ipv4_addresses]}")
        return True
    except socket.gaierror as e:
        print(f"❌ No IPv4 addresses found: {e}")
        return False

def test_connection_with_string(conn_string, description):
    """Test connection with a specific connection string"""
    try:
        print(f"\n🔌 Testing {description}...")
        print(f"   Connection: {conn_string.split('@')[1].split('/')[0]}")
        
        conn = psycopg.connect(conn_string)
        cur = conn.cursor()
        
        # Test basic query
        cur.execute("SELECT COUNT(*) FROM race_events")
        count = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        print(f"✅ {description} - SUCCESS! Found {count} race events")
        return True
        
    except Exception as e:
        print(f"❌ {description} - FAILED: {e}")
        return False

def main():
    """Test all connection methods"""
    print("🚀 Testing Supabase connections for IPv6-only network...")
    
    # Test IPv4 resolution
    has_ipv4 = test_ipv4_resolution()
    
    # Test different connection strings
    success = False
    for i, conn_string in enumerate(CONNECTION_STRINGS):
        descriptions = [
            "Direct connection (port 5432)",
            "Connection pooler (port 6543)", 
            "Connection with options"
        ]
        
        if test_connection_with_string(conn_string, descriptions[i]):
            success = True
            print(f"\n🎉 SUCCESS! Use this connection string:")
            print(f"   {conn_string}")
            break
    
    if not success:
        print("\n❌ All connection attempts failed.")
        print("\n🔧 Possible solutions:")
        print("1. Use a VPN that supports IPv6")
        print("2. Use a different network (mobile hotspot)")
        print("3. Deploy to Railway first and test from there")
        print("4. Use Supabase's REST API instead of direct DB connection")
    
    return success

if __name__ == "__main__":
    main()
