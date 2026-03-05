"""API v1 Router - aggregates all endpoint routers."""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.clients import router as clients_router
from app.api.v1.matters import router as matters_router
from app.api.v1.contacts import router as contacts_router
from app.api.v1.documents import router as documents_router
from app.api.v1.time_entries import router as time_entries_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.trust_accounts import router as trust_accounts_router
from app.api.v1.portal import router as portal_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router
from app.api.v1.currencies import router as currencies_router
from app.api.v1 import ai

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(clients_router)
api_router.include_router(matters_router)
api_router.include_router(contacts_router)
api_router.include_router(documents_router)
api_router.include_router(time_entries_router)
api_router.include_router(invoices_router)
api_router.include_router(trust_accounts_router)
api_router.include_router(portal_router)
api_router.include_router(tasks_router)
api_router.include_router(analytics_router)
api_router.include_router(admin_router)
api_router.include_router(currencies_router)
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
