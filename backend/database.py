import os
from sqlmodel import SQLModel, create_engine, Session

# Use persistent storage directory if running on Render with storage mount
db_dir = "/data" if os.path.exists("/data") else "."
db_path = os.path.join(db_dir, "jharokha.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}").strip()

# SQLite needs connect_args={"check_same_thread": False} to run in multi-threaded FastAPI.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)
    # Check if photo_url exists in user table, if not, add it in a database-agnostic way
    from sqlalchemy import inspect, text
    try:
        inspector = inspect(engine)
        columns = [c["name"] for c in inspector.get_columns("user")]
        if "photo_url" not in columns:
            print("Migrating User table to add photo_url...")
            with Session(engine) as session:
                session.execute(text('ALTER TABLE "user" ADD COLUMN photo_url TEXT'))
                session.commit()
                print("User table migration completed successfully.")
    except Exception as e:
        print(f"Migration error: {e}")

def get_session():
    with Session(engine) as session:
        yield session
