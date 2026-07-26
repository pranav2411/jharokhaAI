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
    # Check if photo_url exists in user table, if not, add it
    from sqlalchemy import text
    with Session(engine) as session:
        try:
            # check columns in user table
            res = session.execute(text("PRAGMA table_info(user)")).fetchall()
            cols = [r[1] for r in res]
            if "photo_url" not in cols:
                print("Migrating User table to add photo_url...")
                session.execute(text("ALTER TABLE user ADD COLUMN photo_url TEXT"))
                session.commit()
        except Exception as e:
            print(f"Migration error: {e}")

def get_session():
    with Session(engine) as session:
        yield session
