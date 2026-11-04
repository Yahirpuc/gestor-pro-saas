"""Visual configuration for generated PDFs.

Edit colors, fonts and spacing here without touching the document logic.
"""
from reportlab.lib import colors

# Brand / palette
BRAND = colors.HexColor("#4f46e5")
BRAND_DARK = colors.HexColor("#312e81")
ACCENT = colors.HexColor("#10b981")
INK = colors.HexColor("#18181b")
MUTED = colors.HexColor("#71717a")
LINE = colors.HexColor("#e4e4e7")
SURFACE = colors.HexColor("#f6f6f7")

# Typography
FONT_TITLE = "Helvetica-Bold"
FONT_HEADING = "Helvetica-Bold"
FONT_BODY = "Helvetica"
FONT_META = "Helvetica"

SIZE_TITLE = 18
SIZE_HEADING = 11
SIZE_BODY = 9.5
SIZE_META = 8.5
SIZE_SMALL = 7.5

# Layout
PAGE_MARGIN_MM = 20
META_LABEL_WIDTH_MM = 38
META_VALUE_WIDTH_MM = 125

# Texts (i18n-ish, default Spanish)
CONFIDENTIAL_LABEL = "Confidencial"
PAGE_LABEL = "Página"
PROVIDER_LABEL = "Proveedor"
CLIENT_LABEL = "Cliente"
GENERATED_BY = "Generado por"
