"""Custom exceptions for HomeMind Ai integration."""

from homeassistant.exceptions import HomeAssistantError


class AIAgentHAError(HomeAssistantError):
    """Base exception for HomeMind Ai errors."""

    pass


class AIProviderError(AIAgentHAError):
    """Exception raised when there's an error with an AI provider."""

    def __init__(self, provider: str, message: str, status_code: int | None = None):
        """Initialize AI provider error."""
        self.provider = provider
        self.status_code = status_code
        super().__init__(f"[{provider}] {message}")


class APIKeyError(AIAgentHAError):
    """Exception raised when API key is invalid or missing."""

    def __init__(self, provider: str, message: str = "Invalid or missing API key"):
        """Initialize API key error."""
        self.provider = provider
        super().__init__(f"[{provider}] {message}")


class ModelNotFoundError(AIAgentHAError):
    """Exception raised when a model is not found."""

    def __init__(self, provider: str, model: str):
        """Initialize model not found error."""
        self.provider = provider
        self.model = model
        super().__init__(
            f"[{provider}] Model '{model}' not found. Please verify the model name."
        )


class RateLimitError(AIAgentHAError):
    """Exception raised when rate limit is exceeded."""

    def __init__(self, provider: str, retry_after: int | None = None):
        """Initialize rate limit error."""
        self.provider = provider
        self.retry_after = retry_after
        message = f"[{provider}] Rate limit exceeded"
        if retry_after:
            message += f". Please try again after {retry_after} seconds."
        else:
            message += ". Please try again later."
        super().__init__(message)


class ConfigurationError(AIAgentHAError):
    """Exception raised when there's a configuration error."""

    def __init__(self, message: str):
        """Initialize configuration error."""
        super().__init__(f"Configuration error: {message}")


class EmptyResponseError(AIAgentHAError):
    """Exception raised when AI provider returns empty response."""

    def __init__(self, provider: str):
        """Initialize empty response error."""
        self.provider = provider
        super().__init__(
            f"[{provider}] AI provider returned empty response. Please try again."
        )


class TimeoutError(AIAgentHAError):
    """Exception raised when a request times out."""

    def __init__(self, provider: str, timeout: int):
        """Initialize timeout error."""
        self.provider = provider
        self.timeout = timeout
        super().__init__(
            f"[{provider}] Request timed out after {timeout} seconds. Please try again."
        )


class JSONParseError(AIAgentHAError):
    """Exception raised when JSON parsing fails."""

    def __init__(self, message: str, response_preview: str | None = None):
        """Initialize JSON parse error."""
        error_msg = f"Failed to parse JSON response: {message}"
        if response_preview:
            error_msg += f"\nResponse preview: {response_preview[:200]}"
        super().__init__(error_msg)
