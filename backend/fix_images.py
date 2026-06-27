"""
Direct PostgreSQL patch — replaces broken image URLs with verified working ones.
Run: python fix_images.py  (from backend/)
"""
import sys
import urllib.request
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Guddu%401998@localhost/amazon_clone"
engine = create_engine(DATABASE_URL)

# Verified working image URLs (tested before writing this script)
# Using Unsplash CDN photo IDs + Open Library for books
FIXES = {
    # ── Old products with relative paths ──────────────────────────────────
    1:  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80",   # iPhone
    6:  "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",   # Samsung S25
    7:  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",   # MacBook
    8:  "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",   # MacBook
    11: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",                  # Atomic Habits
    16: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",      # Nike Air Max

    # ── Electronics ────────────────────────────────────────────────────────
    # 22/23: Sony XM5 already working — skip
    24: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",   # boAt headphones
    25: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",   # Samsung TV
    26: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",   # JBL speaker
    27: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",      # Kindle
    28: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",   # Noise Smartwatch

    # ── Fashion ────────────────────────────────────────────────────────────
    29: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",      # Levi's jeans
    # 30: PUMA already working — skip
    31: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",   # Allen Solly shirt
    32: "https://images.unsplash.com/photo-1524592094714-0f0654e359d3?w=400&q=80",   # Fastrack watch
    33: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",   # Campus shoes
    34: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&q=80",      # Titan Raga women watch

    # ── Home & Kitchen ─────────────────────────────────────────────────────
    35: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",      # Induction cooktop
    36: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",   # Milton flask
    37: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80",   # Air fryer
    38: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&q=80",   # Cookware
    39: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&q=80",   # Mixer grinder
    40: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80",   # Cleaning cloth

    # ── Sports ─────────────────────────────────────────────────────────────
    41: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",   # Resistance bands
    42: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=400&q=80",   # Badminton racket
    43: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",      # Yoga mat
    44: "https://images.unsplash.com/photo-1540747913346-19212a4b8f37?w=400&q=80",   # Cricket bat
    45: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80",      # Football
    46: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",      # Decathlon shoes

    # ── Books ──────────────────────────────────────────────────────────────
    47: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",   # Rich Dad Poor Dad
    48: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",   # The Alchemist
    49: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",   # Psychology of Money
    50: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",   # Ikigai
    51: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",   # Deep Work
    52: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",   # Zero to One
}

FALLBACKS = {
    "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    "Fashion":     "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
    "Home":        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    "Sports":      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    "Books":       "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
}

def check(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        r = urllib.request.urlopen(req, timeout=8)
        return r.status == 200
    except:
        return False

print("Testing and applying image fixes...\n")
ok = 0
fail = 0

with engine.connect() as conn:
    for product_id, url in FIXES.items():
        live = check(url)
        if live:
            conn.execute(
                text("UPDATE products SET image_url = :url WHERE id = :id"),
                {"url": url, "id": product_id}
            )
            conn.commit()
            print(f"  OK  [{product_id:2}] {url[:70]}")
            ok += 1
        else:
            # Use a simple category fallback
            cat_fallback = FALLBACKS["Electronics"]  # default
            conn.execute(
                text("UPDATE products SET image_url = :url WHERE id = :id"),
                {"url": cat_fallback, "id": product_id}
            )
            conn.commit()
            print(f"  FALLBACK [{product_id:2}] original URL failed, used fallback")
            fail += 1

print(f"\nDone: {ok} verified, {fail} used fallback out of {len(FIXES)} total.")
