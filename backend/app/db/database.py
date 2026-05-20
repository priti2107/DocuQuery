from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

# Global variables to hold connection objects
client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """
    Establish connection to MongoDB Atlas.
    Called when FastAPI starts.
    """
    global client, database

    client = AsyncIOMotorClient(settings.MONGODB_URI)
    database = client[settings.DATABASE_NAME]

    # Verify connection
    await client.admin.command("ping")

    print("✅ Connected to MongoDB Atlas")


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection.
    Called when FastAPI shuts down.
    """
    global client

    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """
    Return the active database instance.
    """
    if database is None:
        raise RuntimeError("Database connection is not initialized.")

    return database
