#!/usr/bin/env python3
"""
Script to create or promote a user to OWNER role
Run this script to give yourself admin access
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.models import User, Role

def create_admin_user():
    """Create or promote a user to OWNER role"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Please set it to your Supabase connection string")
        return False
    
    try:
        # Create database connection
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        print("🔍 Checking existing users...")
        
        # Get user email from input
        email = input("Enter your email address: ").strip()
        if not email:
            print("❌ Email is required")
            return False
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"✅ Found user: {user.email} (Role: {user.role.value})")
            
            if user.role == Role.OWNER:
                print("🎉 User is already an OWNER!")
                return True
            
            # Promote to OWNER
            user.role = Role.OWNER
            db.commit()
            print(f"🎉 Successfully promoted {user.email} to OWNER!")
            
        else:
            print(f"❌ User with email {email} not found")
            print("Available users:")
            users = db.query(User).all()
            for u in users:
                print(f"  - {u.email} (Role: {u.role.value})")
            
            # Ask if they want to create a new user
            create_new = input("Do you want to create a new OWNER user? (y/n): ").strip().lower()
            if create_new == 'y':
                name = input("Enter your name: ").strip()
                password = input("Enter password: ").strip()
                
                if not name or not password:
                    print("❌ Name and password are required")
                    return False
                
                # Create new user
                new_user = User(
                    email=email,
                    name=name,
                    password_hash=User.hash_password(password),
                    role=Role.OWNER
                )
                
                db.add(new_user)
                db.commit()
                print(f"🎉 Successfully created OWNER user: {email}")
            else:
                print("❌ No user created")
                return False
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🔑 Race History - Create Admin User")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("app"):
        print("❌ Please run this script from the backend directory")
        print("Current directory:", os.getcwd())
        return
    
    success = create_admin_user()
    
    if success:
        print("\n🎉 Admin user setup complete!")
        print("You can now access the admin page at:")
        print("https://race-history.vercel.app/admin")
    else:
        print("\n❌ Failed to create admin user")

if __name__ == "__main__":
    main()
