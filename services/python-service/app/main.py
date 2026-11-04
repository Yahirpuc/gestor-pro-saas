"""
Orbit Studio OS — Auxiliary Python service.

Responsibilities:
  * Render software contracts and commercial proposals as professional PDFs (ReportLab).
  * Provide lightweight project-health analytics.

Run with:  uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from pydantic import BaseModel, Field
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.pdf_config import (
    BRAND,
    BRAND_DARK,
    ACCENT,
    INK,
    MUTED,
    LINE,
    SURFACE,
    FONT_TITLE,
    FONT_HEADING,
    FONT_BODY,
    FONT_META,
    SIZE_TITLE,
    SIZE_HEADING,
    SIZE_BODY,
    SIZE_META,
    SIZE_SMALL,
    PAGE_MARGIN_MM,
    META_LABEL_WIDTH_MM,
    META_VALUE_WIDTH_MM,
    CONFIDENTIAL_LABEL,
    PAGE_LABEL,
    PROVIDER_LABEL,
    CLIENT_LABEL,
    GENERATED_BY,
)

app = FastAPI(
    title="Orbit Auxiliary Service",
    description="Contract and proposal PDF generation and project analytics.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #
class ClientInfo(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None


class ProjectInfo(BaseModel):
    title: Optional[str] = None


class ContractPayload(BaseModel):
    title: str = Field(..., min_length=1)
    template: Optional[str] = "Software Development Agreement"
    content: Optional[str] = ""
    scope: Optional[str] = ""
    timeline: Optional[str] = ""
    amount: Optional[float] = 0
    currency: Optional[str] = "USD"
    intellectualProperty: Optional[str] = ""
    status: Optional[str] = "Draft"
    signedAt: Optional[str] = None
    client: Optional[ClientInfo] = None
    project: Optional[ProjectInfo] = None
    signer: Optional[str] = None
    companyName: Optional[str] = None


class ProposalPayload(BaseModel):
    title: str = Field(..., min_length=1)
    summary: Optional[str] = ""
    scope: Optional[str] = ""
    deliverables: Optional[str] = ""
    amount: Optional[float] = 0
    currency: Optional[str] = "USD"
    validUntil: Optional[str] = None
    status: Optional[str] = "Draft"
    client: Optional[ClientInfo] = None
    project: Optional[ProjectInfo] = None
    signer: Optional[str] = None
    companyName: Optional[str] = None


class ProjectAnalyticsItem(BaseModel):
    id: str
    title: str
    status: str
    progress: int = 0
    budget: float = 0
    startDate: Optional[str] = None
    endDate: Optional[str] = None


class AnalyticsPayload(BaseModel):
    projects: List[ProjectAnalyticsItem] = []


# --------------------------------------------------------------------------- #
# PDF helpers
# --------------------------------------------------------------------------- #
def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName=FONT_TITLE, fontSize=SIZE_TITLE,
                                leading=SIZE_TITLE + 4, textColor=INK, spaceAfter=4, alignment=TA_CENTER),
        "subtitle": ParagraphStyle("Subtitle", parent=base["Normal"], fontName=FONT_BODY, fontSize=SIZE_META,
                                   leading=SIZE_META + 2, textColor=MUTED, alignment=TA_CENTER),
        "heading": ParagraphStyle("Heading", parent=base["Heading2"], fontName=FONT_HEADING, fontSize=SIZE_HEADING,
                                  leading=SIZE_HEADING + 3, textColor=BRAND, spaceBefore=12, spaceAfter=4),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontName=FONT_BODY, fontSize=SIZE_BODY,
                               leading=SIZE_BODY + 5, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=6),
        "meta": ParagraphStyle("Meta", parent=base["Normal"], fontName=FONT_META, fontSize=SIZE_META,
                               leading=SIZE_META + 2, textColor=MUTED),
        "small": ParagraphStyle("Small", parent=base["Normal"], fontName=FONT_META, fontSize=SIZE_SMALL,
                                leading=SIZE_SMALL + 2, textColor=MUTED),
        "bullet": ParagraphStyle("Bullet", parent=base["Normal"], fontName=FONT_BODY, fontSize=SIZE_BODY,
                                 leading=SIZE_BODY + 5, textColor=INK, leftIndent=12, spaceAfter=3),
    }


def _esc(text: str) -> str:
    return (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _content_flowables(content: str, styles) -> list:
    flowables = []
    for raw in (content or "").split("\n"):
        line = raw.strip()
        if not line:
            flowables.append(Spacer(1, 3))
            continue
        if line.upper() == line and len(line) > 8 and not line[0].isdigit():
            flowables.append(Paragraph(_esc(line.title()), styles["heading"]))
        elif len(line) > 3 and line[0].isdigit() and line[1] in (".", ")"):
            flowables.append(Paragraph(_esc(line).upper(), styles["heading"]))
        elif line.isupper() and len(line) < 60:
            flowables.append(Paragraph(_esc(line).title(), styles["heading"]))
        else:
            flowables.append(Paragraph(_esc(line), styles["body"]))
    return flowables or [Paragraph("El documento no tiene contenido.", styles["body"])]


def _meta_table(rows, styles):
    table = Table(rows, colWidths=[META_LABEL_WIDTH_MM * mm, META_VALUE_WIDTH_MM * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#ececee")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def _footer(canvas, doc_obj, company_name):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(PAGE_MARGIN_MM * mm, 14 * mm, A4[0] - PAGE_MARGIN_MM * mm, 14 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(PAGE_MARGIN_MM * mm, 9.5 * mm, f"{company_name or 'Studio'} — {CONFIDENTIAL_LABEL}")
    canvas.drawRightString(A4[0] - PAGE_MARGIN_MM * mm, 9.5 * mm, f"{PAGE_LABEL} {doc_obj.page}")
    canvas.restoreState()


def build_contract_pdf(payload: ContractPayload) -> io.BytesIO:
    styles = _styles()
    buffer = io.BytesIO()
    company_name = payload.companyName or "Studio"

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=PAGE_MARGIN_MM * mm, rightMargin=PAGE_MARGIN_MM * mm,
        topMargin=PAGE_MARGIN_MM * mm, bottomMargin=PAGE_MARGIN_MM * mm,
        title=payload.title, author=company_name, subject=payload.template or "Contrato",
    )

    story = [
        Paragraph(company_name.upper(), styles["subtitle"]),
        Spacer(1, 4),
        Paragraph(_esc(payload.title), styles["title"]),
        Paragraph(_esc(payload.template or "Contrato de Desarrollo de Software"), styles["subtitle"]),
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=0.8, color=LINE, spaceAfter=10),
    ]

    client_name = "—"
    if payload.client:
        client_name = payload.client.name or "—"
        if payload.client.company:
            client_name = f"{client_name} · {payload.client.company}"

    meta_rows = [
        [Paragraph("<b>Cliente</b>", styles["meta"]), Paragraph(_esc(client_name), styles["meta"])],
        [Paragraph("<b>Proyecto</b>", styles["meta"]), Paragraph(_esc(payload.project.title if payload.project and payload.project.title else "—"), styles["meta"])],
        [Paragraph("<b>Importe</b>", styles["meta"]), Paragraph(_esc(f"{payload.currency} {payload.amount:,.2f}"), styles["meta"])],
        [Paragraph("<b>Plazo</b>", styles["meta"]), Paragraph(_esc(payload.timeline or "Por acordar"), styles["meta"])],
        [Paragraph("<b>Estado</b>", styles["meta"]), Paragraph(_esc(payload.status or "Borrador"), styles["meta"])],
    ]
    story += [_meta_table(meta_rows, styles), Spacer(1, 12)]

    story += _content_flowables(payload.content or "", styles)

    if payload.scope:
        story += [Paragraph("Alcance del trabajo", styles["heading"]), Paragraph(_esc(payload.scope), styles["body"])]
    if payload.intellectualProperty:
        story += [Paragraph("Propiedad intelectual", styles["heading"]), Paragraph(_esc(payload.intellectualProperty), styles["body"])]

    signer = payload.signer or payload.client.name if payload.client else "Proveedor"
    client_sig = payload.client.name if payload.client else CLIENT_LABEL

    story += [
        Spacer(1, 20),
        HRFlowable(width="100%", thickness=0.6, color=LINE, spaceAfter=12),
        Table(
            [[
                Paragraph(f"_______________________________<br/>{PROVIDER_LABEL}: {signer}", styles["small"]),
                Paragraph(f"_______________________________<br/>{CLIENT_LABEL}: {client_sig}", styles["small"]),
            ]],
            colWidths=[85 * mm, 85 * mm],
            style=TableStyle([("VALIGN", (0, 0), (-1, -1), "BOTTOM"), ("TOPPADDING", (0, 0), (-1, -1), 16)]),
        ),
        Spacer(1, 12),
        Paragraph(f"{GENERATED_BY} {company_name} · {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", styles["small"]),
    ]

    doc.build(story, onFirstPage=lambda c, d: _footer(c, d, company_name),
             onLaterPages=lambda c, d: _footer(c, d, company_name))
    buffer.seek(0)
    return buffer


def build_proposal_pdf(payload: ProposalPayload) -> io.BytesIO:
    styles = _styles()
    buffer = io.BytesIO()
    company_name = payload.companyName or "Studio"

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=PAGE_MARGIN_MM * mm, rightMargin=PAGE_MARGIN_MM * mm,
        topMargin=PAGE_MARGIN_MM * mm, bottomMargin=PAGE_MARGIN_MM * mm,
        title=payload.title, author=company_name, subject="Propuesta comercial",
    )

    story = [
        Paragraph(company_name.upper(), styles["subtitle"]),
        Spacer(1, 4),
        Paragraph(_esc(payload.title), styles["title"]),
        Paragraph("Propuesta comercial", styles["subtitle"]),
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=0.8, color=LINE, spaceAfter=10),
    ]

    client_name = "—"
    if payload.client:
        client_name = payload.client.name or "—"
        if payload.client.company:
            client_name = f"{client_name} · {payload.client.company}"

    meta_rows = [
        [Paragraph("<b>Cliente</b>", styles["meta"]), Paragraph(_esc(client_name), styles["meta"])],
        [Paragraph("<b>Proyecto</b>", styles["meta"]), Paragraph(_esc(payload.project.title if payload.project and payload.project.title else "—"), styles["meta"])],
        [Paragraph("<b>Importe</b>", styles["meta"]), Paragraph(_esc(f"{payload.currency} {payload.amount:,.2f}"), styles["meta"])],
        [Paragraph("<b>Válida hasta</b>", styles["meta"]), Paragraph(_esc(payload.validUntil or "Sin caducidad"), styles["meta"])],
        [Paragraph("<b>Estado</b>", styles["meta"]), Paragraph(_esc(payload.status or "Borrador"), styles["meta"])],
    ]
    story += [_meta_table(meta_rows, styles), Spacer(1, 12)]

    if payload.summary:
        story += [Paragraph("Resumen", styles["heading"]), Paragraph(_esc(payload.summary), styles["body"])]
    if payload.scope:
        story += [Paragraph("Alcance del trabajo", styles["heading"]), Paragraph(_esc(payload.scope), styles["body"])]
    if payload.deliverables:
        story += [Paragraph("Entregables", styles["heading"]), Paragraph(_esc(payload.deliverables), styles["body"])]

    signer = payload.signer or "Proveedor"

    story += [
        Spacer(1, 20),
        HRFlowable(width="100%", thickness=0.6, color=LINE, spaceAfter=12),
        Paragraph(f"Preparado por: {signer}", styles["small"]),
        Spacer(1, 4),
        Paragraph(f"{GENERATED_BY} {company_name} · {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", styles["small"]),
    ]

    doc.build(story, onFirstPage=lambda c, d: _footer(c, d, company_name),
             onLaterPages=lambda c, d: _footer(c, d, company_name))
    buffer.seek(0)
    return buffer


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.get("/health")
def health():
    return {"status": "ok", "service": "orbit-python-service", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/templates")
def templates():
    return {
        "templates": [
            {"id": "software-development", "name": "Contrato de Desarrollo de Software",
             "description": "Desarrollo de software a medida con transferencia de propiedad intelectual tras el pago total."},
            {"id": "enterprise", "name": "Contrato de Software Empresarial",
             "description": "Proyecto corporativo con requisitos de compliance y seguridad."},
            {"id": "saas", "name": "Contrato de Suscripción SaaS",
             "description": "Acceso recurrente a una plataforma alojada."},
            {"id": "maintenance", "name": "Contrato de Mantenimiento",
             "description": "Soporte posterior al lanzamiento, corrección de errores y actualizaciones de seguridad."},
        ]
    }


@app.post("/api/contracts/pdf")
def contract_pdf(payload: ContractPayload):
    if not payload.title.strip():
        raise HTTPException(status_code=422, detail="El título del contrato es obligatorio")
    try:
        pdf = build_contract_pdf(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc
    safe_name = "".join(c if c.isalnum() or c in "-_ " else "-" for c in payload.title).strip()
    filename = f"{safe_name or 'contract'}.pdf".replace(" ", "-").lower()
    return StreamingResponse(pdf, media_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@app.post("/api/proposals/pdf")
def proposal_pdf(payload: ProposalPayload):
    if not payload.title.strip():
        raise HTTPException(status_code=422, detail="El título de la propuesta es obligatorio")
    try:
        pdf = build_proposal_pdf(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc
    safe_name = "".join(c if c.isalnum() or c in "-_ " else "-" for c in payload.title).strip()
    filename = f"{safe_name or 'proposal'}.pdf".replace(" ", "-").lower()
    return StreamingResponse(pdf, media_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@app.post("/api/analysis/project-health")
def project_health(payload: AnalyticsPayload):
    now = datetime.now(timezone.utc)
    results = []
    for project in payload.projects:
        score = 100
        risks = []
        if project.endDate:
            try:
                end = datetime.fromisoformat(project.endDate.replace("Z", "+00:00"))
                if end.tzinfo is None:
                    end = end.replace(tzinfo=timezone.utc)
                days_left = (end - now).days
                if days_left < 0 and project.status != "Completed":
                    score -= 45
                    risks.append(f"Plazo superado por {abs(days_left)} días")
                elif days_left <= 7 and project.status not in ("Completed", "In Review"):
                    score -= 20
                    risks.append(f"Vence en {days_left} días")
                if project.startDate:
                    start = datetime.fromisoformat(project.startDate.replace("Z", "+00:00"))
                    if start.tzinfo is None:
                        start = start.replace(tzinfo=timezone.utc)
                    total = max((end - start).days, 1)
                    elapsed = min(max((now - start).days, 0), total)
                    expected = round((elapsed / total) * 100)
                    if expected - project.progress > 25:
                        score -= 25
                        risks.append(f"Progreso {project.progress}% vs esperado {expected}%")
            except ValueError:
                risks.append("Formato de fecha inválido")
        if project.status in ("In Review", "Completed") and project.progress >= 80:
            score += 5
        if project.status == "Backlog" and project.progress > 20:
            score -= 10
            risks.append("Progreso registrado mientras sigue en backlog")
        score = max(0, min(100, score))
        results.append({"id": project.id, "title": project.title, "score": score,
                        "level": "healthy" if score >= 80 else "at-risk" if score >= 55 else "critical",
                        "risks": risks})
    overall = round(sum(r["score"] for r in results) / len(results)) if results else 100
    return {"overall": overall, "projects": results}
