"""
PDF / DOCX text extraction.

Pulls plain text from TOR attachments so the parser can extract verified facts.
Uses pdfplumber for PDFs and python-docx for Word documents. Network fetching
is the caller's responsibility; these helpers operate on bytes.
"""

from __future__ import annotations

import io


def extract_pdf_text(data: bytes) -> str:
    """Return concatenated page text from a PDF byte stream."""
    try:
        import pdfplumber
    except ImportError:  # pragma: no cover
        return ""

    out: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            out.append(page.extract_text() or "")
    return "\n".join(out).strip()


def extract_docx_text(data: bytes) -> str:
    """Return paragraph text from a DOCX byte stream."""
    try:
        import docx
    except ImportError:  # pragma: no cover
        return ""

    document = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in document.paragraphs).strip()


def extract_text(data: bytes, content_type: str) -> str:
    ct = content_type.lower()
    if "pdf" in ct:
        return extract_pdf_text(data)
    if "word" in ct or "officedocument" in ct or ct.endswith("docx"):
        return extract_docx_text(data)
    return ""
