"""
Seed multiple real gallery images for each product.
Run once: python seed_product_images.py
"""
from database import engine, SessionLocal
import models

# Create table if not exists
models.Base.metadata.create_all(bind=engine)

# product_id → list of image URLs (first is the "primary" / hero image)
PRODUCT_IMAGES = {
    # ── MacBook Air M4 (IDs 7 & 8) ──────────────────────────────────────
    7: [
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    ],
    8: [
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    ],

    # ── iPhone 15 (ID 1) ─────────────────────────────────────────────────
    1: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600",
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600",
        "https://images.unsplash.com/photo-1621330396098-05a2a4e5f3b4?w=600",
    ],

    # ── Samsung Galaxy S25 (ID 6) ─────────────────────────────────────────
    6: [
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
        "https://images.unsplash.com/photo-1568910748155-01ca3426cefa?w=600",
        "https://images.unsplash.com/photo-1587033411391-5d9e51cce789?w=600",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
    ],

    # ── Samsung 55" 4K TV (ID 25) ─────────────────────────────────────────
    25: [
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
        "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600",
        "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600",
    ],

    # ── Sony WH-1000XM5 Headphones (ID 22 & 23) ──────────────────────────
    22: [
        "https://m.media-amazon.com/images/I/51aXvjzcukL._SX522_.jpg",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
        "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600",
    ],
    23: [
        "https://m.media-amazon.com/images/I/51aXvjzcukL._SX522_.jpg",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
        "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600",
    ],

    # ── boAt Rockerz 450 Headphones (ID 24) ──────────────────────────────
    24: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
        "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600",
        "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600",
    ],

    # ── JBL Flip 6 Speaker (ID 26) ───────────────────────────────────────
    26: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
        "https://images.unsplash.com/photo-1547394765-185e1e68b046?w=600",
        "https://images.unsplash.com/photo-1545454675-3b197c4a2e57?w=600",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    ],

    # ── Kindle Paperwhite (ID 27) ─────────────────────────────────────────
    27: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
    ],

    # ── Noise Smartwatch (ID 28) ──────────────────────────────────────────
    28: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600",
        "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600",
    ],

    # ── Nike Air Max Shoes (ID 16) ────────────────────────────────────────
    16: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600",
    ],

    # ── PUMA Running Shoes (ID 30) ────────────────────────────────────────
    30: [
        "https://m.media-amazon.com/images/I/71vFKBpKakL._UX575_.jpg",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600",
    ],

    # ── Campus Running Shoes (ID 33) ──────────────────────────────────────
    33: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600",
    ],

    # ── Decathlon Running Shoes (ID 46) ───────────────────────────────────
    46: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
    ],

    # ── Levi's 511 Jeans (ID 29) ──────────────────────────────────────────
    29: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
        "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600",
        "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600",
        "https://images.unsplash.com/photo-1604176354204-926c7f68b323?w=600",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600",
    ],

    # ── Allen Solly Formal Shirt (ID 31) ──────────────────────────────────
    31: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600",
        "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=600",
    ],

    # ── Fastrack Watch (ID 32) ────────────────────────────────────────────
    32: [
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600",
        "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600",
    ],

    # ── Titan Raga Watch for Women (ID 34) ────────────────────────────────
    34: [
        "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600",
    ],

    # ── Prestige Induction Cooktop (ID 35) ────────────────────────────────
    35: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
        "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600",
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600",
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600",
    ],

    # ── Milton Flask (ID 36) ──────────────────────────────────────────────
    36: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600",
        "https://images.unsplash.com/photo-1504699439244-d41b1f8c81fd?w=600",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600",
    ],

    # ── Philips Air Fryer (ID 37) ─────────────────────────────────────────
    37: [
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600",
        "https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=600",
    ],

    # ── Pigeon Cookware Set (ID 38) ───────────────────────────────────────
    38: [
        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600",
        "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600",
        "https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=600",
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600",
    ],

    # ── Butterfly Mixer Grinder (ID 39) ───────────────────────────────────
    39: [
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
        "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600",
    ],

    # ── AmazonBasics Microfibre Cloth (ID 40) ────────────────────────────
    40: [
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600",
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600",
    ],

    # ── Boldfit Resistance Bands (ID 41) ──────────────────────────────────
    41: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
        "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600",
    ],

    # ── Yonex Badminton Racquet (ID 42) ───────────────────────────────────
    42: [
        "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600",
        "https://images.unsplash.com/photo-1613918431703-aa50889e3be0?w=600",
        "https://images.unsplash.com/photo-1595869942641-4e074a7a8d7d?w=600",
    ],

    # ── Yoga Mat (ID 43) ──────────────────────────────────────────────────
    43: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
    ],

    # ── Cosco Cricket Bat (ID 44) ─────────────────────────────────────────
    44: [
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600",
        "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600",
        "https://images.unsplash.com/photo-1595869942641-4e074a7a8d7d?w=600",
    ],

    # ── Nivia Football (ID 45) ────────────────────────────────────────────
    45: [
        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600",
        "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600",
        "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=600",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600",
    ],

    # ── Books (keep cover as primary, add lifestyle) ───────────────────────
    11: [
        "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
    ],
    47: [
        "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
    ],
    48: [
        "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
    ],
    49: [
        "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
    ],
    50: [
        "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
    ],
    51: [
        "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600",
    ],
    52: [
        "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
        "https://images.unsplash.com/photo-1507842217343-0190de7e1ef7?w=600",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
    ],
}


def seed():
    db = SessionLocal()
    try:
        # Clear existing entries so re-running is safe
        db.query(models.ProductImage).delete()
        db.commit()

        total = 0
        for product_id, urls in PRODUCT_IMAGES.items():
            # Check product exists
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            if not product:
                print(f"  SKIP product {product_id} — not found in DB")
                continue
            for order, url in enumerate(urls):
                img = models.ProductImage(product_id=product_id, image_url=url, sort_order=order)
                db.add(img)
            total += len(urls)
            print(f"  + Product {product_id} ({product.name[:35]}) — {len(urls)} images")

        db.commit()
        print(f"\nDone. Seeded {total} images for {len(PRODUCT_IMAGES)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
