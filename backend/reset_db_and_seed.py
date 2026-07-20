import os
import sys
from sqlmodel import SQLModel, Session
from database import engine
import models
from seed import seed_data

def reset_and_seed():
    print("Connecting to database engine:", engine)
    
    print("Dropping all existing database tables...")
    SQLModel.metadata.drop_all(engine)
    print("Database tables dropped successfully.")
    
    print("Re-creating all database tables with latest schema...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")
    
    print("Seeding fresh data...")
    seed_data()
    print("Seeding completed successfully.")

if __name__ == "__main__":
    reset_and_seed()
