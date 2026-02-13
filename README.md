# Legal CMS - AI-First Legal Practice Management

A next-generation legal case management system with AI-powered features for international law firms.

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- pnpm (recommended) or npm

### 1. Start Infrastructure

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Verify services are running
docker compose ps
```

### 2. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 |

## 📁 Project Structure

```
legal-cms/
├── frontend/          # Next.js 15 + TypeScript + Tailwind
├── backend/           # FastAPI + SQLAlchemy + Alembic
├── docker/            # Docker configurations
├── docker-compose.yml # Local development infrastructure
└── README.md
```

## 🛠 Tech Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **SQLAlchemy 2.0** - Async ORM
- **Alembic** - Database migrations
- **PostgreSQL 15** - Primary database (with pgvector for future AI)
- **Redis** - Caching and session management

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **TanStack Query** - Server state management

## 📋 Phase 1 Features (MVP)

- [ ] User authentication & authorization
- [ ] Client management (CRUD)
- [ ] Matter management (CRUD)
- [ ] Contact management
- [ ] Document storage & search
- [ ] Basic time tracking
- [ ] Simple billing
- [ ] Role-based access control

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See individual service READMEs for required variables.

## 📄 License

Proprietary - All rights reserved
