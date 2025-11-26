import os
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base

try:
    from supernova_2177_ui_weighted.db_models import ProposalVote, Harmonizer
    SUPER_NOVA_AVAILABLE = True
    Base = None
except ImportError:
    SUPER_NOVA_AVAILABLE = False
    Base = declarative_base()

    class Harmonizer(Base):
        __tablename__ = "harmonizers"

        id = Column(Integer, primary_key=True, index=True)
        username = Column(String, unique=True, nullable=False)
        email = Column(String, nullable=True)
        hashed_password = Column(String, nullable=True)

    class ProposalVote(Base):
        __tablename__ = "proposal_votes"

        id = Column(Integer, primary_key=True, index=True)
        proposal_id = Column(Integer, nullable=False)
        harmonizer_id = Column(Integer, ForeignKey("harmonizers.id"), nullable=False)
        voter_type = Column(String, nullable=True)
        vote = Column(String, nullable=True)
        choice = Column(String, nullable=True)


DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:example@db:5432/postgres")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if Base is not None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()