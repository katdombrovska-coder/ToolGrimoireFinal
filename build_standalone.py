#!/usr/bin/env python3
"""Build standalone index.html from Emergent export: fix paths, remove Emergent deps, keep body visible."""
import re

src = "../../Emergent _ Fullstack App.html. ai.html"
dst = "index.html"

with open(src, "r", encoding="utf-8", errors="replace") as f:
    html = f.read()

# Point all asset paths to current directory
html = html.replace("./Emergent _ Fullstack App.html. ai_files/", "./")

# Remove emergent-main.js (preview logger that postMessages to parent)
html = re.sub(r'<script[^>]*src="\./emergent-main\.js"[^>]*></script>\s*', "", html)

# Force body visible: override unresolved hiding so content doesn't disappear
html = html.replace(
    "body[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; }",
    "body[unresolved] {opacity: 0; } body { opacity: 1 !important; }"
)

# Remove veepn-lock-screen (browser extension / paywall overlay)
html = re.sub(r"<veepn-lock-screen>.*?</veepn-lock-screen>", "", html, flags=re.DOTALL)

# Remove "Made with Emergent" badge
html = re.sub(r'<a\s+id="emergent-badge"[^>]*>.*?</a>\s*', "", html, flags=re.DOTALL)

# Rebrand: Emergent | Fullstack App -> AI Tools Atlas
html = re.sub(r"<!-- saved from url=\([^)]+\) -->", "<!-- AI Tools Atlas -->", html)
html = html.replace('<meta name="description" content="A product of emergent.sh">',
    '<meta name="description" content="AI Tools Atlas - Curated directory of 400+ AI tools">')
html = html.replace("<title>Emergent | Fullstack App</title>", "<title>AI Tools Atlas</title>")
# Add og/twitter meta if not present
if 'og:title' not in html:
    html = html.replace(
        '<meta name="description" content="AI Tools Atlas - Curated directory of 400+ AI tools">',
        '''<meta name="description" content="AI Tools Atlas - Curated directory of 400+ AI tools">
        <meta property="og:title" content="AI Tools Atlas">
        <meta property="og:site_name" content="AI Tools Atlas">
        <meta name="twitter:title" content="AI Tools Atlas">'''
    )

with open(dst, "w", encoding="utf-8") as f:
    f.write(html)

print("Wrote", dst)
