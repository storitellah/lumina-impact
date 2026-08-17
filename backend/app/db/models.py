"""
SQLAlchemy storage models.

PostgreSQL is the structured store. Full-text search is served by a generated
`tsvector` column (`search_vector`) with a GIN index, so the terminal's search
box maps to a single indexed query.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Computed,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TSVECTOR
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


class OpportunityRow(Base):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    organization: Mapped[str] = mapped_column(String, nullable=False)
    organization_domain: Mapped[str] = mapped_column(String, nullable=False)

    assignment_type: Mapped[str] = mapped_column(String, nullable=False)
    engagement_type: Mapped[str] = mapped_column(String, nullable=False)

    region: Mapped[str] = mapped_column(String, index=True)
    country: Mapped[str] = mapped_column(String, index=True)
    field_site: Mapped[str | None] = mapped_column(String, nullable=True)
    security_tier: Mapped[str | None] = mapped_column(String, nullable=True)
    on_site: Mapped[bool] = mapped_column(Boolean, default=True)

    thematic_focus: Mapped[str] = mapped_column(String, index=True)
    source: Mapped[str] = mapped_column(String, index=True)

    brief: Mapped[str] = mapped_column(Text)
    deliverables: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    consent_requirements: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    budget: Mapped[dict] = mapped_column(JSONB, default=dict)
    contact: Mapped[dict] = mapped_column(JSONB, default=dict)
    attachments: Mapped[list] = mapped_column(JSONB, default=list)

    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    deadline_timezone: Mapped[str] = mapped_column(String)

    credibility_score: Mapped[int] = mapped_column(Integer, default=0, index=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    # Full-text search vector maintained by PostgreSQL.
    search_vector: Mapped[str | None] = mapped_column(
        TSVECTOR,
        Computed(
            "to_tsvector('english', "
            "coalesce(title,'') || ' ' || coalesce(organization,'') || ' ' || "
            "coalesce(country,'') || ' ' || coalesce(field_site,'') || ' ' || "
            "coalesce(brief,''))",
            persisted=True,
        ),
        nullable=True,
    )

    __table_args__ = (
        Index("ix_opportunities_search", "search_vector", postgresql_using="gin"),
    )


engine = create_engine(settings.database_url, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)
