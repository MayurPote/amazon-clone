"""
Seed script — adds 3 new categories + ~30 products.
Run from the backend/ directory while the FastAPI server is running:
    python seed_products.py
"""
import requests

BASE = "http://localhost:8000"

# ── 1. Ensure categories exist ─────────────────────────────────────────────
for name in ["Fashion", "Home & Kitchen", "Sports"]:
    r = requests.post(f"{BASE}/categories/", json={"name": name})
    print(f"  Category '{name}': {r.status_code} {r.text[:60]}")

cat_map = {c["name"]: c["id"] for c in requests.get(f"{BASE}/categories/").json()}
print("Category IDs:", cat_map, "\n")

# ── 2. Products ────────────────────────────────────────────────────────────
PRODUCTS = [
    # Electronics ────────────────────────────────────────────────────────
    {
        "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        "description": "Industry-leading noise cancellation with 30-hour battery life. Crystal-clear calls with 8 microphones and precise voice pickup. Connect to 2 Bluetooth devices simultaneously.",
        "price": 24990, "original_price": 34990, "discount_percent": 29,
        "stock": 85, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/51aXvjzcukL._SX522_.jpg",
        "rating": 4.7, "reviews": 15420, "is_best_seller": True,
    },
    {
        "name": "boAt Rockerz 450 Bluetooth On-Ear Headphones",
        "description": "40mm dynamic drivers for immersive audio. Up to 15 hours playtime. Foldable design. Built-in mic for hands-free calls. Soft padded earcups.",
        "price": 1299, "original_price": 2990, "discount_percent": 57,
        "stock": 320, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/71BI8-M+K9L._SX522_.jpg",
        "rating": 4.3, "reviews": 85230, "is_best_seller": True,
    },
    {
        "name": "Samsung 55 Inch 4K Ultra HD Smart LED TV",
        "description": "Crystal-clear 4K UHD with HDR10+ support. Built-in Alexa. Netflix, Prime Video, YouTube ready. 3 HDMI, 2 USB ports. Slim bezel design.",
        "price": 42990, "original_price": 62990, "discount_percent": 32,
        "stock": 42, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/71pvaYdSFVL._SX522_.jpg",
        "rating": 4.4, "reviews": 12300, "is_best_seller": False,
    },
    {
        "name": "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
        "description": "Bold JBL Pro sound with racetrack-shaped driver. IP67 waterproof & dustproof. 12 hours playtime. PartyBoost to connect multiple JBL speakers.",
        "price": 9999, "original_price": 13999, "discount_percent": 29,
        "stock": 156, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/71LKXS5BNGL._SX522_.jpg",
        "rating": 4.6, "reviews": 23450, "is_best_seller": True,
    },
    {
        "name": "Kindle Paperwhite 16 GB — 6.8 inch Display, Adjustable Warm Light",
        "description": "300 ppi glare-free display. Adjustable warm light. Waterproof (IPX8). 10-week battery life. Stores thousands of books.",
        "price": 12999, "original_price": 16999, "discount_percent": 24,
        "stock": 200, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/61bVgqGJfAL._SX522_.jpg",
        "rating": 4.6, "reviews": 45230, "is_best_seller": False,
    },
    {
        "name": "Noise ColorFit Pro 4 Smartwatch AMOLED Display",
        "description": "1.72 inch AMOLED, 500 nits brightness. SpO2, heart rate, stress monitor. 100+ sports modes. 7-day battery life. Always-on display.",
        "price": 2499, "original_price": 6999, "discount_percent": 64,
        "stock": 410, "category_id": cat_map["Electronics"],
        "image_url": "https://m.media-amazon.com/images/I/61nqzLbDDQL._SX522_.jpg",
        "rating": 4.2, "reviews": 67890, "is_best_seller": True,
    },

    # Fashion ─────────────────────────────────────────────────────────────
    {
        "name": "Levi's Men's 511 Slim Fit Jeans",
        "description": "Classic slim fit below the waist. Stretch denim for all-day comfort. Sits below the waist, slim through hip and thigh. Available in multiple washes.",
        "price": 2999, "original_price": 4999, "discount_percent": 40,
        "stock": 180, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/71HJXG-miqL._UY741_.jpg",
        "rating": 4.4, "reviews": 12340, "is_best_seller": True,
    },
    {
        "name": "PUMA Men's Softride Running Shoes",
        "description": "SOFTRIDE foam midsole for plush comfort. Breathable mesh upper. Rubber outsole for grip. Ideal for running, gym, and casual wear.",
        "price": 3499, "original_price": 5999, "discount_percent": 42,
        "stock": 95, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/71vFKBpKakL._UX575_.jpg",
        "rating": 4.3, "reviews": 8920, "is_best_seller": False,
    },
    {
        "name": "Allen Solly Men's Slim Fit Formal Shirt",
        "description": "Premium cotton blend. Slim fit with spread collar. Perfect for office and formal occasions. Machine washable. Available in multiple colours.",
        "price": 999, "original_price": 2499, "discount_percent": 60,
        "stock": 260, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/71X3BP-YJML._UX569_.jpg",
        "rating": 4.2, "reviews": 15670, "is_best_seller": False,
    },
    {
        "name": "Fastrack Analog Watch for Men",
        "description": "Trendy casual watch with bold dial. Stainless steel case. 3 ATM water resistant. Mineral glass. Genuine leather strap. 2-year brand warranty.",
        "price": 1795, "original_price": 2995, "discount_percent": 40,
        "stock": 145, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/71VRJ+7l5QL._UX679_.jpg",
        "rating": 4.3, "reviews": 34560, "is_best_seller": True,
    },
    {
        "name": "Campus Men's Running Shoes (Lightweight)",
        "description": "Breathable mesh upper. Cushioned EVA midsole. Anti-skid rubber outsole. Ideal for running, walking, and gymming. Great value for money.",
        "price": 1299, "original_price": 2499, "discount_percent": 48,
        "stock": 320, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/81R4tVqxXXL._UX575_.jpg",
        "rating": 4.1, "reviews": 45670, "is_best_seller": True,
    },
    {
        "name": "Titan Raga Analog Watch for Women",
        "description": "Elegant rose-gold case and bracelet. MOP dial with stone-set bezel. Water resistant to 30m. 1-year brand warranty. Gift packaging included.",
        "price": 4995, "original_price": 7495, "discount_percent": 33,
        "stock": 78, "category_id": cat_map["Fashion"],
        "image_url": "https://m.media-amazon.com/images/I/71o+TauvWoL._UX679_.jpg",
        "rating": 4.5, "reviews": 9230, "is_best_seller": False,
    },

    # Home & Kitchen ───────────────────────────────────────────────────────
    {
        "name": "Prestige PIC 20 1600-Watt Induction Cooktop",
        "description": "Auto voltage regulator for safe operation. Feather touch controls. 7 preset menus for Indian cooking. Timer up to 3 hours. Anti-magnetic wall.",
        "price": 2299, "original_price": 3499, "discount_percent": 34,
        "stock": 130, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/61z+a+k0VBL._SX522_.jpg",
        "rating": 4.4, "reviews": 18430, "is_best_seller": True,
    },
    {
        "name": "Milton Thermosteel Flip Lid Flask 750 ml",
        "description": "Double-wall vacuum insulation. Keeps hot 24 hrs or cold 24 hrs. BPA-free, food-safe. Leak-proof flip lid. Easy-grip design.",
        "price": 799, "original_price": 1299, "discount_percent": 38,
        "stock": 500, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/31hqiKiqpQL._SX300_SY300_QL70_FMwebp_.jpg",
        "rating": 4.5, "reviews": 67890, "is_best_seller": True,
    },
    {
        "name": "Philips HD9252 Air Fryer with Rapid Air Technology",
        "description": "Up to 90% less fat than traditional frying. 1400W, 0.8kg capacity. Digital touch display. Timer up to 60 min. Dishwasher-safe drawer.",
        "price": 8999, "original_price": 12995, "discount_percent": 31,
        "stock": 64, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/61A-sAGq1YL._SX522_.jpg",
        "rating": 4.4, "reviews": 23450, "is_best_seller": True,
    },
    {
        "name": "Pigeon Stainless Steel 5-Piece Cookware Set",
        "description": "5-ply stainless steel with aluminium core. Induction compatible. Includes 3 sauce pans, 1 wok, 1 frying pan. Dishwasher safe. 5-year warranty.",
        "price": 1799, "original_price": 2999, "discount_percent": 40,
        "stock": 87, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/71mf4caI0IL._SX522_.jpg",
        "rating": 4.3, "reviews": 12340, "is_best_seller": False,
    },
    {
        "name": "Butterfly Smart 750W Mixer Grinder with 4 Jars",
        "description": "750W motor with overload protection. 4 stainless steel jars for dry grinding, wet grinding, chutney and juicing. Speed regulator. 2-year warranty.",
        "price": 2499, "original_price": 3999, "discount_percent": 37,
        "stock": 110, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/61w1CQMR9iL._SX522_.jpg",
        "rating": 4.2, "reviews": 34560, "is_best_seller": False,
    },
    {
        "name": "AmazonBasics Microfibre Cleaning Cloth Pack of 24",
        "description": "Ultra-fine fibre splits and grabs dirt without scratching. Lint-free, reusable up to 500 washes. Great for car, kitchen, electronics. Machine washable.",
        "price": 699, "original_price": 1299, "discount_percent": 46,
        "stock": 750, "category_id": cat_map["Home & Kitchen"],
        "image_url": "https://m.media-amazon.com/images/I/71i38p9TlUL._SX522_.jpg",
        "rating": 4.3, "reviews": 89230, "is_best_seller": True,
    },

    # Sports ──────────────────────────────────────────────────────────────
    {
        "name": "Boldfit Resistance Bands Set of 5 — Exercise Bands",
        "description": "5 latex bands: 5 to 50 lbs resistance. Perfect for yoga, pilates, physiotherapy, fitness training. Includes carry pouch and workout guide.",
        "price": 599, "original_price": 1299, "discount_percent": 54,
        "stock": 430, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/71q7bOgbcmL._SX522_.jpg",
        "rating": 4.4, "reviews": 34560, "is_best_seller": True,
    },
    {
        "name": "Yonex ZR 100 Light Badminton Racquet with Full Cover",
        "description": "Isometric aluminium frame for larger sweet spot. Lightweight 95g. Pre-strung and ready to play. Full cover included. Great for beginners.",
        "price": 1149, "original_price": 1999, "discount_percent": 43,
        "stock": 210, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/61K7rl8MKWL._SX522_.jpg",
        "rating": 4.5, "reviews": 67890, "is_best_seller": True,
    },
    {
        "name": "RitFit Exercise Yoga Mat with Carry Bag",
        "description": "6mm thick NBR foam for superior cushioning. Non-slip surface. Moisture resistant. 183x61 cm. Includes carry strap. Multiple colours available.",
        "price": 999, "original_price": 1799, "discount_percent": 44,
        "stock": 290, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/71gEZx7xGLL._SX522_.jpg",
        "rating": 4.5, "reviews": 23450, "is_best_seller": False,
    },
    {
        "name": "Cosco All Star Cricket Bat Short Handle",
        "description": "Made from premium Kashmir willow. Full-size short handle bat. Ideal for hard tennis and leather ball practice. Grip and cover included.",
        "price": 1299, "original_price": 1999, "discount_percent": 35,
        "stock": 115, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/61QSXhLiA6L._SX522_.jpg",
        "rating": 4.2, "reviews": 5670, "is_best_seller": False,
    },
    {
        "name": "Nivia Storm Football Size 5",
        "description": "PU outer casing with high-quality rubber bladder. Size 5 official match weight. 32-panel hand-stitched construction. Suitable for all surfaces.",
        "price": 799, "original_price": 1299, "discount_percent": 38,
        "stock": 340, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/71FLfUFJRJL._SX522_.jpg",
        "rating": 4.3, "reviews": 8920, "is_best_seller": False,
    },
    {
        "name": "Decathlon Kiprun KD500 Women's Running Shoes",
        "description": "Designed for intermediate runners. LIGHT FOAM cushioned midsole. Breathable mesh upper. Heel-to-toe drop: 10mm. Weight: 260g.",
        "price": 2999, "original_price": 4499, "discount_percent": 33,
        "stock": 78, "category_id": cat_map["Sports"],
        "image_url": "https://m.media-amazon.com/images/I/714mVJd5K8L._UX575_.jpg",
        "rating": 4.4, "reviews": 12340, "is_best_seller": True,
    },

    # Books ───────────────────────────────────────────────────────────────
    {
        "name": "Rich Dad Poor Dad — Robert T. Kiyosaki",
        "description": "The #1 personal finance book. What the rich teach their kids about money that the poor and middle class do not. Challenges the myth that you need a high income to be rich.",
        "price": 349, "original_price": 595, "discount_percent": 41,
        "stock": 600, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/81BE7eeKzAL._SY466_.jpg",
        "rating": 4.6, "reviews": 156780, "is_best_seller": True,
    },
    {
        "name": "The Alchemist — Paulo Coelho",
        "description": "A magical story about following your dreams. Santiago, an Andalusian shepherd boy, travels from Spain to Egypt in search of treasure. A timeless classic.",
        "price": 199, "original_price": 350, "discount_percent": 43,
        "stock": 800, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SY466_.jpg",
        "rating": 4.7, "reviews": 245670, "is_best_seller": True,
    },
    {
        "name": "The Psychology of Money — Morgan Housel",
        "description": "19 short stories exploring strange ways people think about money. Timeless lessons on wealth, greed, and happiness. A must-read personal finance book.",
        "price": 449, "original_price": 699, "discount_percent": 36,
        "stock": 420, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/71g2ednj0JL._SY466_.jpg",
        "rating": 4.7, "reviews": 89430, "is_best_seller": True,
    },
    {
        "name": "Ikigai: The Japanese Secret to a Long and Happy Life",
        "description": "Explores the Japanese concept of 'Ikigai' — a reason for being — through the lives and wisdom of Japanese centenarians living on the island of Okinawa.",
        "price": 299, "original_price": 399, "discount_percent": 25,
        "stock": 530, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/71eSLPQ0RQL._SY466_.jpg",
        "rating": 4.5, "reviews": 78560, "is_best_seller": False,
    },
    {
        "name": "Deep Work — Cal Newport",
        "description": "Rules for focused success in a distracted world. Newport argues that the ability to focus deeply on cognitively demanding tasks is increasingly rare and valuable.",
        "price": 499, "original_price": 799, "discount_percent": 38,
        "stock": 310, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/81JJ7fyyKyS._SY466_.jpg",
        "rating": 4.6, "reviews": 45670, "is_best_seller": False,
    },
    {
        "name": "Zero to One — Peter Thiel",
        "description": "Notes on startups and how to build the future. Peter Thiel argues that monopoly is the condition of every successful business that wants to make a lasting impact.",
        "price": 399, "original_price": 699, "discount_percent": 43,
        "stock": 270, "category_id": cat_map["Books"],
        "image_url": "https://m.media-amazon.com/images/I/71VSJFVMhEL._SY466_.jpg",
        "rating": 4.5, "reviews": 34560, "is_best_seller": False,
    },
]

# ── 3. POST each product ───────────────────────────────────────────────────
ok = 0
for p in PRODUCTS:
    r = requests.post(f"{BASE}/products/", json=p)
    if r.status_code == 200:
        ok += 1
        pid = r.json().get("id", "?")
        print(f"  OK [{pid}] {p['name'][:60]}")
    else:
        print(f"  FAIL {p['name'][:45]} -> {r.status_code}: {r.text[:80]}")

print(f"\n{'='*55}")
print(f"  {ok}/{len(PRODUCTS)} products added successfully.")
