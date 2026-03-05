"""AI Service layer for external AI providers."""
from app.services.providers.silicon_flow import SiliconFlowService
from app.core.config import settings

def get_silicon_flow_service() -> SiliconFlowService | None:
    """Get SiliconFlow service instance if configured."""
    if not settings.SILICONFLOW_API_KEY:
        return None
    return SiliconFlowService()

__all__ = ["get_silicon_flow_service", "SiliconFlowService"]
