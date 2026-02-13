# Backend - FastAPI

Legal CMS Backend API built with FastAPI, SQLAlchemy 2.0, and Alembic.

## Quick Start with Docker

```bash
# From the project root directory
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Access the API at http://localhost:8000
```

## Local Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/api/v1/openapi.json

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh tokens

### Users
- `GET /api/v1/users` - List users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update current user
- `GET /api/v1/users/{id}` - Get user by ID
- `PATCH /api/v1/users/{id}` - Update user (admin)
- `DELETE /api/v1/users/{id}` - Deactivate user (admin)

### Clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients` - List clients
- `GET /api/v1/clients/{id}` - Get client
- `PATCH /api/v1/clients/{id}` - Update client
- `DELETE /api/v1/clients/{id}` - Delete client
- `POST /api/v1/clients/{id}/conflict-check` - Mark conflict check complete

### Matters
- `POST /api/v1/matters` - Create matter
- `GET /api/v1/matters` - List matters
- `GET /api/v1/matters/{id}` - Get matter
- `PATCH /api/v1/matters/{id}` - Update matter
- `POST /api/v1/matters/{id}/close` - Close matter
- `POST /api/v1/matters/{id}/reopen` - Reopen matter
- `DELETE /api/v1/matters/{id}` - Delete matter

### Contacts
- `POST /api/v1/contacts` - Create contact
- `GET /api/v1/contacts` - List contacts
- `GET /api/v1/contacts/{id}` - Get contact
- `PATCH /api/v1/contacts/{id}` - Update contact
- `DELETE /api/v1/contacts/{id}` - Delete contact

### Documents
- `POST /api/v1/documents` - Create document record
- `GET /api/v1/documents` - List documents
- `GET /api/v1/documents/{id}` - Get document
- `PATCH /api/v1/documents/{id}` - Update document metadata
- `DELETE /api/v1/documents/{id}` - Delete document
- `GET /api/v1/documents/matter/{matter_id}` - List matter documents

### Time Entries
- `POST /api/v1/time-entries` - Create time entry
- `GET /api/v1/time-entries` - List time entries
- `GET /api/v1/time-entries/my` - List my time entries
- `GET /api/v1/time-entries/summary` - Get time entry summary
- `GET /api/v1/time-entries/{id}` - Get time entry
- `PATCH /api/v1/time-entries/{id}` - Update time entry
- `POST /api/v1/time-entries/{id}/submit` - Submit for approval
- `POST /api/v1/time-entries/{id}/approve` - Approve time entry
- `DELETE /api/v1/time-entries/{id}` - Delete time entry

## Project Structure

```
backend/
├── app/
│   ├── api/           # API routes
│   │   ├── v1/        # API version 1
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── clients.py
│   │   │   ├── matters.py
│   │   │   ├── contacts.py
│   │   │   ├── documents.py
│   │   │   ├── time_entries.py
│   │   │   └── router.py
│   │   └── deps.py    # Dependencies (auth, db)
│   ├── core/          # Core configuration
│   │   ├── config.py  # Settings
│   │   └── security.py# Auth utilities
│   ├── db/            # Database
│   │   └── database.py
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   └── main.py        # FastAPI app entry
├── alembic/           # Database migrations
├── tests/             # Test suite
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```
