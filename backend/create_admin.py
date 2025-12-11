from app.db import SessionLocal, engine
from app import models
from app.services.auth import get_password_hash

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

admin = models.User(
    email="admin@opdatacleaner.com",
    full_name="Administrator",
    hashed_password=get_password_hash("admin123"),
    role="admin",
    is_active=True
)
db.add(admin)
db.commit()
print("✅ Admin creado: admin@opdatacleaner.com / admin123")
