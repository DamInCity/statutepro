"""Create initial admin and lawyer users."""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import hash_password as get_password_hash
from app.models.user import User, UserRole

async def create_initial_users():
    """Create admin and lawyer users."""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Check if admin exists
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "admin@example.com")
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            # Create admin user
            admin = User(
                email="admin@example.com",
                first_name="Admin",
                last_name="User",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin)
            print("✅ Created admin user: admin@example.com / admin123")
        else:
            print("ℹ️  Admin user already exists")
        
        # Check if lawyer exists
        result = await session.execute(
            select(User).where(User.email == "lawyer@example.com")
        )
        lawyer = result.scalar_one_or_none()
        
        if not lawyer:
            # Create lawyer user
            lawyer = User(
                email="lawyer@example.com",
                first_name="Lawyer",
                last_name="User",
                hashed_password=get_password_hash("lawyer123"),
                role=UserRole.PARTNER,
                is_active=True
            )
            session.add(lawyer)
            print("✅ Created lawyer user: lawyer@example.com / lawyer123")
        else:
            print("ℹ️  Lawyer user already exists")
        
        await session.commit()
        print("\n✅ User creation complete!")
        print("\nLogin credentials:")
        print("  Admin:  admin@example.com / admin123")
        print("  Lawyer: lawyer@example.com / lawyer123")

if __name__ == "__main__":
    asyncio.run(create_initial_users())
