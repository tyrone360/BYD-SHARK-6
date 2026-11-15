from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path("_Assets/Branding")
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 1024
img = Image.new("RGB", (SIZE, SIZE), "#101b27")
d = ImageDraw.Draw(img)

def p(points):
    return [(int(x * SIZE / 600), int(y * SIZE / 600)) for x, y in points]

# Outer metallic badge
outer = [(300,38),(500,145),(465,390),(300,505),(135,390),(100,145)]
d.polygon(p(outer), fill="#263746", outline="#dce6ed", width=13)

# Inner electric-blue border
inner = [(300,58),(478,155),(447,375),(300,476),(153,375),(122,155)]
d.line(p(inner + [inner[0]]), fill="#25bce9", width=6)

# Shark silhouette
shark = [
    (112,280),(205,244),(265,194),(302,112),
    (340,225),(420,215),(485,245),(432,273),
    (480,303),(405,319),(350,350),(285,355),
    (220,332),(155,315)
]
d.polygon(p(shark), fill="#c5d1da", outline="#e5f8ff", width=5)

# Blue tail and fin
d.polygon(p([(220,332),(155,315),(112,280),(135,352)]), fill="#087eb8")
d.polygon(p([(302,112),(340,225),(315,218)]), fill="#25bce9")

# Eye and gills
d.ellipse((int(413*SIZE/600), int(244*SIZE/600),
           int(427*SIZE/600), int(258*SIZE/600)), fill="#07131f")

d.line(p([(365,270),(350,310),(383,267),(370,307)]),
       fill="#344c5d", width=7)

# Speed lines
d.line(p([(155,220),(220,220)]), fill="#25bce9", width=6)
d.line(p([(135,240),(195,240)]), fill="#25bce9", width=6)

# BYD lettering
font_path = r"C:\Windows\Fonts\arialbd.ttf"
font = ImageFont.truetype(font_path, 67)
text = "BYD"
box = d.textbbox((0,0), text, font=font)
text_width = box[2] - box[0]
d.text(((SIZE-text_width)//2, int(375*SIZE/600)),
       text, font=font, fill="#e5edf2",
       stroke_width=1, stroke_fill="#536575")

for filename, dimension in [
    ("icon-192.png", 192),
    ("icon-512.png", 512),
    ("apple-touch-icon.png", 180)
]:
    resized = img.resize((dimension, dimension), Image.Resampling.LANCZOS)
    resized.save(OUT / filename, "PNG")
    print(f"Created {filename}: {dimension}x{dimension}")

print("BYD SHARK 6 app icons created successfully!")
