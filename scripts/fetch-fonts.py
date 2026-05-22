import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
out = ROOT / "assets" / "fonts"
out.mkdir(parents=True, exist_ok=True)

ua = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}
url = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
req = urllib.request.Request(url, headers=ua)
css = urllib.request.urlopen(req).read().decode()

blocks = re.split(r"(?=/\* arabic \*/)", css)
seen = {}
lines = []
for block in blocks:
    if "arabic" not in block[:20]:
        continue
    m_w = re.search(r"font-weight:\s*(\d+)", block)
    m_u = re.search(r"url\((https://[^)]+\.woff2)\)", block)
    if not m_w or not m_u:
        continue
    w = m_w.group(1)
    src = m_u.group(1)
    if w in seen:
        continue
    seen[w] = src
    fname = f"cairo-{w}.woff2"
    dest = out / fname
    print("download", w, len(urllib.request.urlopen(src).read()), "bytes")
    dest.write_bytes(urllib.request.urlopen(src).read())
    lines.append(
        f"""@font-face {{
  font-family: 'Cairo';
  font-style: normal;
  font-weight: {w};
  font-display: swap;
  src: url('../fonts/{fname}') format('woff2');
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC;
}}"""
    )

(ROOT / "assets" / "css" / "fonts.css").write_text("\n\n".join(lines) + "\n", encoding="utf-8")
print("done", sorted(seen.keys()))
