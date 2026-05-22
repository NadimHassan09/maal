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

SUBSETS = {
    "arabic": {
        "file": "cairo-arabic.woff2",
        "unicode-range": (
            "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, "
            "U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, "
            "U+FE70-FE74, U+FE76-FEFC"
        ),
    },
    "latin": {
        "file": "cairo-latin.woff2",
        "unicode-range": (
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, "
            "U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, "
            "U+2212, U+2215, U+FEFF, U+FFFD"
        ),
    },
}

lines = []
for subset_name, meta in SUBSETS.items():
    blocks = re.split(rf"(?=/\* {subset_name} \*/)", css)
    src_url = None
    for block in blocks:
        if subset_name not in block[:30]:
            continue
        m_u = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if m_u:
            src_url = m_u.group(1)
            break
    if not src_url:
        raise SystemExit(f"Could not find {subset_name} woff2 URL")
    data = urllib.request.urlopen(src_url).read()
    dest = out / meta["file"]
    dest.write_bytes(data)
    print(subset_name, dest.name, len(data), "bytes")
    lines.append(
        f"""@font-face {{
  font-family: 'Cairo';
  font-style: normal;
  font-weight: 400 800;
  font-display: swap;
  src: url('../fonts/{meta["file"]}') format('woff2');
  unicode-range: {meta["unicode-range"]};
}}"""
    )

(ROOT / "assets" / "css" / "fonts.css").write_text("\n\n".join(lines) + "\n", encoding="utf-8")
print("wrote fonts.css")
