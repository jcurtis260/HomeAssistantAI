"""Utility functions for AI Agent HA integration."""

from __future__ import annotations

import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .exceptions import ConfigurationError


def validate_entity_id(entity_id: str) -> bool:
    """Validate that an entity ID has the correct format.

    Args:
        entity_id: The entity ID to validate

    Returns:
        True if valid, False otherwise
    """
    if not entity_id or not isinstance(entity_id, str):
        return False
    # Entity ID format: domain.entity_name
    pattern = r"^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$"
    return bool(re.match(pattern, entity_id.lower()))


def validate_domain(domain: str) -> bool:
    """Validate that a domain name is valid.

    Args:
        domain: The domain to validate

    Returns:
        True if valid, False otherwise
    """
    if not domain or not isinstance(domain, str):
        return False
    # Domain format: lowercase letters, numbers, underscores
    pattern = r"^[a-z_][a-z0-9_]*$"
    return bool(re.match(pattern, domain.lower()))


def sanitize_input(text: str, max_length: int = 10000) -> str:
    """Sanitize user input to prevent injection attacks.

    Args:
        text: The text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized text

    Raises:
        ConfigurationError: If input is invalid
    """
    if not isinstance(text, str):
        raise ConfigurationError("Input must be a string")
    if len(text) > max_length:
        raise ConfigurationError(f"Input exceeds maximum length of {max_length} characters")
    # Remove null bytes and control characters (except newlines and tabs)
    sanitized = re.sub(r"[\x00-\x08\x0B-\x0C\x0E-\x1F]", "", text)
    return sanitized.strip()


def validate_dashboard_config(config: dict[str, Any]) -> tuple[bool, str]:
    """Validate a dashboard configuration.

    Args:
        config: The dashboard configuration dictionary

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(config, dict):
        return False, "Dashboard config must be a dictionary"

    # Check required fields
    if "title" not in config:
        return False, "Dashboard config missing required 'title' field"
    if "url_path" not in config:
        return False, "Dashboard config missing required 'url_path' field"
    if "views" not in config:
        return False, "Dashboard config missing required 'views' field"

    # Validate url_path format
    url_path = config.get("url_path", "")
    if not isinstance(url_path, str) or not url_path:
        return False, "Dashboard url_path must be a non-empty string"
    if not re.match(r"^[a-z0-9-_]+$", url_path.lower()):
        return False, "Dashboard url_path contains invalid characters (use only a-z, 0-9, -, _)"

    # Validate views
    views = config.get("views", [])
    if not isinstance(views, list):
        return False, "Dashboard views must be a list"
    if len(views) == 0:
        return False, "Dashboard must have at least one view"

    return True, ""


def validate_automation_config(config: dict[str, Any]) -> tuple[bool, str]:
    """Validate an automation configuration.

    Args:
        config: The automation configuration dictionary

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(config, dict):
        return False, "Automation config must be a dictionary"

    # Check required fields
    if "alias" not in config:
        return False, "Automation config missing required 'alias' field"
    if "trigger" not in config:
        return False, "Automation config missing required 'trigger' field"
    if "action" not in config:
        return False, "Automation config missing required 'action' field"

    # Validate trigger
    trigger = config.get("trigger", [])
    if not isinstance(trigger, list) or len(trigger) == 0:
        return False, "Automation trigger must be a non-empty list"

    # Validate action
    action = config.get("action", [])
    if not isinstance(action, list) or len(action) == 0:
        return False, "Automation action must be a non-empty list"

    return True, ""


def check_entity_exists(hass: HomeAssistant, entity_id: str) -> bool:
    """Check if an entity exists in Home Assistant.

    Args:
        hass: Home Assistant instance
        entity_id: The entity ID to check

    Returns:
        True if entity exists, False otherwise
    """
    try:
        if not validate_entity_id(entity_id):
            return False
        state = hass.states.get(entity_id)
        return state is not None
    except Exception:
        return False


def validate_service_call(
    domain: str, service: str, entity_id: str | None = None
) -> tuple[bool, str]:
    """Validate that a service call is safe to execute.

    Args:
        domain: The service domain (e.g., 'light', 'switch')
        service: The service name (e.g., 'turn_on', 'turn_off')
        entity_id: Optional entity ID to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not validate_domain(domain):
        return False, f"Invalid domain: {domain}"

    if not service or not isinstance(service, str):
        return False, "Service name must be a non-empty string"

    # Validate entity_id if provided
    if entity_id and not validate_entity_id(entity_id):
        return False, f"Invalid entity ID: {entity_id}"

    # List of potentially dangerous services (read-only or safe)
    safe_services = {
        "turn_on",
        "turn_off",
        "toggle",
        "open",
        "close",
        "stop",
        "set_temperature",
        "set_hvac_mode",
        "set_preset_mode",
    }

    # Warn about potentially dangerous services
    dangerous_patterns = ["delete", "remove", "uninstall", "factory_reset"]
    service_lower = service.lower()
    if any(pattern in service_lower for pattern in dangerous_patterns):
        return False, f"Service '{domain}.{service}' may be dangerous and is not allowed"

    return True, ""


def get_entity_domain(entity_id: str) -> str | None:
    """Extract the domain from an entity ID.

    Args:
        entity_id: The entity ID

    Returns:
        The domain or None if invalid
    """
    if not validate_entity_id(entity_id):
        return None
    return entity_id.split(".", 1)[0]


def format_error_message(error: Exception, context: str = "") -> str:
    """Format an error message for user display.

    Args:
        error: The exception that occurred
        context: Additional context about where the error occurred

    Returns:
        A user-friendly error message
    """
    error_type = type(error).__name__
    error_msg = str(error)

    # Provide user-friendly messages for common errors
    if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
        return "The request took too long to complete. Please try again."
    if "rate limit" in error_msg.lower():
        return "Too many requests. Please wait a moment and try again."
    if "api key" in error_msg.lower() or "authentication" in error_msg.lower():
        return "Authentication failed. Please check your API key in the integration settings."
    if "not found" in error_msg.lower():
        return "The requested item was not found. Please verify it exists."
    if "connection" in error_msg.lower() or "network" in error_msg.lower():
        return "Network error. Please check your internet connection and try again."

    # Generic error message
    if context:
        return f"An error occurred while {context}: {error_msg}"
    return f"An error occurred: {error_msg}"
