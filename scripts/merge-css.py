from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
tailwind = (ROOT / "assets" / "css" / "tailwind.css").read_text(encoding="utf-8")
custom = (ROOT / "assets" / "css" / "custom.css").read_text(encoding="utf-8")
marker = "/* === custom.css === */\n"
if marker.strip() in tailwind:
    base = tailwind.split(marker)[0]
else:
    base = tailwind.rstrip() + "\n"
(ROOT / "assets" / "css" / "site.css").write_text(base + marker + custom, encoding="utf-8")
print("wrote site.css", (ROOT / "assets" / "css" / "site.css").stat().st_size, "bytes")
