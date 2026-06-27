import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)
from datetime import datetime, timedelta
import random


def generate_history(product_id, current_price, days=90):
    rng = random.Random(product_id * 137 + 42)

    # 2-4 sale events: (day_offset_start, day_offset_end, discount)
    sale_windows = []
    used = set()
    for _ in range(rng.randint(2, 4)):
        for _ in range(20):
            start = rng.randint(4, days - 12)
            dur = rng.randint(2, 5)
            end = start + dur
            if not any(d in used for d in range(start, end + 1)):
                sale_windows.append((start, end, rng.uniform(0.10, 0.28)))
                used.update(range(start, end + 1))
                break

    start_mult = rng.uniform(0.92, 1.22)
    entries = []

    for offset in range(days + 1):
        dt = datetime.now().replace(microsecond=0) - timedelta(days=(days - offset))
        t = offset / days
        base = current_price * (start_mult * (1 - t) + t)
        noise = rng.uniform(-0.035, 0.035)
        price = base * (1 + noise)

        for s_start, s_end, discount in sale_windows:
            if s_start <= offset <= s_end:
                price *= (1 - discount)
                break

        price = max(round(price / 10) * 10, current_price * 0.45)
        entries.append(models.PriceHistory(
            product_id=product_id,
            price=float(price),
            recorded_at=dt,
        ))

    return entries


def main():
    db = SessionLocal()
    try:
        deleted = db.query(models.PriceHistory).delete()
        db.commit()
        print(f"Cleared {deleted} existing price history rows.")

        products = db.query(models.Product).all()
        total = 0
        for p in products:
            entries = generate_history(p.id, p.price)
            for e in entries:
                db.add(e)
            total += len(entries)
            print(f"  #{p.id:3d}: {len(entries)} pts  {p.name[:45]}")

        db.commit()
        print(f"\nDone! Seeded {total} price-history entries for {len(products)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
