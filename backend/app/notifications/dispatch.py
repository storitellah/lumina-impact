"""
Notifications & dispatch — intelligence routing to hello@storitellah.com.

Generates formatted tender summaries, impact briefing decks and procurement
intelligence reports, and delivers:
  * Real-time high-match alerts
  * Hourly high-match roundups
  * The daily 08:00 EAT digest
  * On-demand single-opportunity briefs ("Share Brief via Email")
"""

from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Iterable

from app.config import settings
from app.models.schemas import Opportunity

BRIEF_TEMPLATE = """\
LUMINA Impact — Tender Brief
============================

{title}
{organization} · {country}

Assignment : {assignment_type}
Engagement : {engagement_type}
Region     : {region}  (priority routing)
Deadline   : {deadline} {tz}
Reference  : {reference}
Credibility: {score}% verified

Brief
-----
{brief}

Deliverables
------------
{deliverables}

Submission
----------
{submission}

— Dispatched from the LUMINA Impact terminal.
"""


def render_brief(o: Opportunity) -> str:
    return BRIEF_TEMPLATE.format(
        title=o.title,
        organization=o.organization,
        country=o.country,
        assignment_type=o.assignment_type.value,
        engagement_type=o.engagement_type.value,
        region=o.region.value,
        deadline=o.deadline.strftime("%d %b %Y %H:%M"),
        tz=o.deadline_timezone,
        reference=o.contact.reference_number or "—",
        score=o.credibility_score,
        brief=o.brief,
        deliverables="\n".join(f"  • {d}" for d in o.deliverables) or "  —",
        submission=(o.contact.submission_url or o.contact.email or "—"),
    )


def render_digest(items: Iterable[Opportunity]) -> str:
    lines = ["LUMINA Impact — Daily Digest (08:00 EAT)", "=" * 42, ""]
    for o in items:
        lines.append(
            f"[{o.credibility_score}%] {o.title}\n"
            f"        {o.organization} · {o.country} · "
            f"closes {o.deadline.strftime('%d %b %H:%M')} {o.deadline_timezone}\n"
        )
    return "\n".join(lines)


def _send(subject: str, body: str, to: str | None = None) -> bool:
    to = to or settings.dispatch_email
    if not settings.smtp_host:
        # Not configured — no-op in scaffold. Return False so callers can log.
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_user or settings.dispatch_email
    msg["To"] = to
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
    return True


def send_brief(o: Opportunity, to: str | None = None) -> bool:
    """1-click 'Share Brief via Email' handler."""
    return _send(f"LUMINA Impact Brief — {o.title}", render_brief(o), to)


def send_daily_digest(items: list[Opportunity]) -> bool:
    return _send("LUMINA Impact — Daily Digest", render_digest(items))
