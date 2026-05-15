# Backend - FastAPI

Legal CMS Backend API built with FastAPI, SQLAlchemy 2.0, and Alembic.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # API routes
│   │   ├── v1/        # API version 1
│   │   └── deps.py    # Dependencies (auth, db)
│   ├── core/          # Core configuration
│   │   ├── config.py  # Settings
│   │   └── security.py# Auth utilities
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py        # FastAPI app entry
├── alembic/           # Database migrations
├── tests/             # Test suite
└── requirements.txt
```
