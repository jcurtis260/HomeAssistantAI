"""Config flow for HomeMind Ai integration."""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    TextSelector,
    TextSelectorConfig,
)

from .const import (
    CONF_CUSTOM_SYSTEM_PROMPT,
    CONF_DEFAULT_MODEL,
    CONF_DEFAULT_PROVIDER,
    CONF_LOCAL_MODEL,
    CONF_LOCAL_URL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

PROVIDERS = {
    "llama": "Llama",
    "openai": "OpenAI",
    "gemini": "Google Gemini",
    "openrouter": "OpenRouter",
    "anthropic": "Anthropic (Claude)",
    "alter": "Alter",
    "local": "Local Model",
}

TOKEN_FIELD_NAMES = {
    "llama": "llama_token",
    "openai": "openai_token",
    "gemini": "gemini_token",
    "openrouter": "openrouter_token",
    "anthropic": "anthropic_token",
    "alter": "alter_token",
    "local": CONF_LOCAL_URL,  # For local models, we use URL instead of token
}

TOKEN_LABELS = {
    "llama": "Llama API Token",
    "openai": "OpenAI API Key",
    "gemini": "Google Gemini API Key",
    "openrouter": "OpenRouter API Key",
    "anthropic": "Anthropic API Key",
    "alter": "Alter API Key",
    "local": "Local API URL (e.g., http://localhost:11434/api/generate)",
}

DEFAULT_MODELS = {
    "llama": "Llama-4-Maverick-17B-128E-Instruct-FP8",
    "openai": "gpt-5",
    "gemini": "gemini-2.5-flash",
    "openrouter": "openai/gpt-4o",
    "anthropic": "claude-sonnet-4-5-20250929",
    "alter": "",  # User enters custom model
    "local": "llama3.2",  # Updated to use llama3.2 as default
}

AVAILABLE_MODELS = {
    "openai": [
        "gpt-5",
        "gpt-5-mini",
        "gpt-5-nano",
        "gpt-4.1",
        "gpt-4.1-mini",
        "gpt-4.1-nano",
        "gpt-4o",
        "gpt-4o-mini",
        "o3",
        "o3-mini",
        "o4-mini",
        "o1",
        "o1-preview",
        "o1-mini",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
    ],
    "gemini": [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.5-flash-preview",
        "gemini-2.5-pro-preview",
    ],
    "openrouter": [
        "openai/gpt-4o",
        "openai/gpt-4-turbo",
        "openai/gpt-3.5-turbo",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3-sonnet",
        "anthropic/claude-3-haiku",
        "meta-llama/llama-3.1-70b-instruct",
        "meta-llama/llama-3.2-90b-instruct",
        "google/gemini-pro",
        "mistralai/mixtral-8x7b-instruct",
        "deepseek/deepseek-r1",
    ],
    "anthropic": [
        "claude-sonnet-4-5-20250929",
        "claude-sonnet-4-20250514",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ],
    "llama": [
        "Llama-4-Maverick-17B-128E-Instruct-FP8",
        "Llama-3.1-70B-Instruct",
        "Llama-3.1-8B-Instruct",
        "Llama-3.2-90B-Instruct",
    ],
    # Alter - user enters custom model name only
    "alter": [
        "Custom...",
    ],
    # For local models, provide common Ollama models with llama3.2 as the default
    "local": [
        "llama3.2",
        "llama3",
        "llama3.1",
        "mistral",
        "mixtral",
        "deepseek-coder",
        "Custom...",
    ],
}

DEFAULT_PROVIDER = "openai"


class AiAgentHaConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):  # type: ignore[call-arg,misc]
    """Handle a config flow for HomeMind Ai."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        try:
            return AiAgentHaOptionsFlowHandler(config_entry)
        except Exception as e:
            _LOGGER.error("Error creating options flow: %s", e)
            return None

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            # Check if this provider is already configured
            await self.async_set_unique_id(f"ai_agent_ha_{user_input['ai_provider']}")
            self._abort_if_unique_id_configured()

            self.config_data = {"ai_provider": user_input["ai_provider"]}
            return await self.async_step_configure()

        # Show provider selection form
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required("ai_provider"): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                {"value": k, "label": v} for k, v in PROVIDERS.items()
                            ]
                        )
                    ),
                }
            ),
        )

    async def async_step_configure(self, user_input=None):
        """Handle the configuration step for the selected provider."""
        errors = {}
        provider = self.config_data["ai_provider"]
        token_field = TOKEN_FIELD_NAMES[provider]
        token_label = TOKEN_LABELS[provider]
        default_model = DEFAULT_MODELS[provider]
        # For Alter provider, default to "Custom..." for the dropdown since model is user-provided
        dropdown_default = "Custom..." if provider == "alter" else default_model
        available_models = AVAILABLE_MODELS.get(provider, [default_model])

        if user_input is not None:
            try:
                # Validate the token
                token_value = user_input.get(token_field)
                if not token_value:
                    errors[token_field] = "required"
                    raise InvalidApiKey

                # Store the configuration data
                self.config_data[token_field] = token_value

                # Add model configuration if provided
                selected_model = user_input.get("model")
                custom_model = user_input.get("custom_model")

                _LOGGER.debug(
                    f"Config flow - Provider: {provider}, Selected model: {selected_model}, Custom model: {custom_model}"
                )

                # Initialize models dict if it doesn't exist
                if "models" not in self.config_data:
                    self.config_data["models"] = {}

                if custom_model and custom_model.strip():
                    # Use custom model if provided and not empty
                    self.config_data["models"][provider] = custom_model.strip()
                elif selected_model and selected_model != "Custom...":
                    # Use selected model if it's not the "Custom..." option
                    self.config_data["models"][provider] = selected_model
                else:
                    # For local and alter providers, allow empty model name
                    if provider in ("local", "alter"):
                        self.config_data["models"][provider] = ""
                    else:
                        # Fallback to default model for other providers
                        self.config_data["models"][provider] = default_model

                return self.async_create_entry(
                    title=f"HomeMind Ai ({PROVIDERS[provider]})",
                    data=self.config_data,
                )
            except InvalidApiKey:
                errors["base"] = "invalid_api_key"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        if provider == "local":
            # For local provider, we need both URL and optional model name
            schema_dict = {
                vol.Required(CONF_LOCAL_URL): TextSelector(
                    TextSelectorConfig(type="text")
                ),
            }

            # Add model selection
            model_options = AVAILABLE_MODELS.get("local", ["Custom..."])
            schema_dict[vol.Optional("model", default="Custom...")] = SelectSelector(
                SelectSelectorConfig(options=model_options)
            )
            schema_dict[vol.Optional("custom_model")] = TextSelector(
                TextSelectorConfig(type="text")
            )
            # Add custom system prompt field
            schema_dict[vol.Optional(CONF_CUSTOM_SYSTEM_PROMPT)] = TextSelector(
                TextSelectorConfig(type="text", multiline=True)
            )

            return self.async_show_form(
                step_id="configure",
                data_schema=vol.Schema(schema_dict),
                errors=errors,
                description_placeholders={
                    "token_label": "Local API URL",
                    "provider": PROVIDERS[provider],
                },
            )

        # Build schema for other providers
        schema_dict = {
            vol.Required(token_field): TextSelector(
                TextSelectorConfig(type="password")
            ),
        }

        # Add model selection if available
        if available_models:
            # Add predefined models + custom option (avoid duplicating "Custom...")
            if "Custom..." in available_models:
                model_options = available_models
            else:
                model_options = available_models + ["Custom..."]
            schema_dict[vol.Optional("model", default=dropdown_default)] = (
                SelectSelector(SelectSelectorConfig(options=model_options))
            )
            schema_dict[vol.Optional("custom_model")] = TextSelector(
                TextSelectorConfig(type="text")
            )
        # Add custom system prompt field
        schema_dict[vol.Optional(CONF_CUSTOM_SYSTEM_PROMPT)] = TextSelector(
            TextSelectorConfig(type="text", multiline=True)
        )

        return self.async_show_form(
            step_id="configure",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
            description_placeholders={
                "token_label": token_label,
                "provider": PROVIDERS[provider],
            },
        )


class InvalidApiKey(HomeAssistantError):
    """Error to indicate there is an invalid API key."""


class AiAgentHaOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for HomeMind Ai."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        # Note: config_entry is set automatically by the parent OptionsFlow class
        # Do not set it manually as it's a read-only property
        self.options_data = {}

    async def async_step_init(self, user_input=None):
        """Handle the initial options step - show defaults or provider selection."""
        # Check if this is the first config entry (we'll use it to store defaults)
        all_entries = self.hass.config_entries.async_entries(DOMAIN)
        is_first_entry = len(all_entries) > 0 and all_entries[0].entry_id == self.config_entry.entry_id
        
        # Get current defaults from any entry
        current_default_provider = None
        current_default_model = None
        for entry in all_entries:
            if entry.data.get(CONF_DEFAULT_PROVIDER):
                current_default_provider = entry.data.get(CONF_DEFAULT_PROVIDER)
                current_default_model = entry.data.get(CONF_DEFAULT_MODEL)
                break
        
        # Get configured providers for default selection
        configured_providers = [entry.data.get("ai_provider") for entry in all_entries if entry.data.get("ai_provider")]
        
        if user_input is not None:
            # Check if user wants to set defaults or configure provider
            if "default_provider" in user_input:
                # Setting defaults - update all entries
                default_provider = user_input.get(CONF_DEFAULT_PROVIDER)
                default_model = user_input.get(CONF_DEFAULT_MODEL, "")
                
                for entry in all_entries:
                    updated_data = dict(entry.data)
                    updated_data[CONF_DEFAULT_PROVIDER] = default_provider
                    if default_model:
                        updated_data[CONF_DEFAULT_MODEL] = default_model
                    elif CONF_DEFAULT_MODEL in updated_data:
                        del updated_data[CONF_DEFAULT_MODEL]
                    self.hass.config_entries.async_update_entry(entry, data=updated_data)
                
                # Update hass.data
                if DOMAIN in self.hass.data:
                    self.hass.data[DOMAIN]["default_provider"] = default_provider
                    self.hass.data[DOMAIN]["default_model"] = default_model if default_model else None
                
                # Continue to provider selection
                current_provider = self.config_entry.data.get("ai_provider", DEFAULT_PROVIDER)
                self.options_data = {
                    "ai_provider": current_provider,
                    "current_provider": current_provider,
                }
                return await self.async_step_configure_options()
            else:
                # Provider selection - move to configure
                selected_provider = user_input["ai_provider"]
                current_provider = self.config_entry.data.get("ai_provider", DEFAULT_PROVIDER)
                self.options_data = {
                    "ai_provider": selected_provider,
                    "current_provider": current_provider,
                }
                return await self.async_step_configure_options()

        # Show defaults step first if this is the first entry
        if is_first_entry:
            default_provider_options = [
                {"value": p, "label": PROVIDERS.get(p, p)} 
                for p in configured_providers if p in PROVIDERS
            ]
            if not default_provider_options:
                default_provider_options = [{"value": current_default_provider or DEFAULT_PROVIDER, "label": PROVIDERS.get(current_default_provider or DEFAULT_PROVIDER, "")}]
            
            # Get model options for default provider
            default_model_options = []
            if current_default_provider:
                default_entry = next((e for e in all_entries if e.data.get("ai_provider") == current_default_provider), None)
                if default_entry:
                    models_config = default_entry.data.get("models", {})
                    available_models = AVAILABLE_MODELS.get(current_default_provider, [])
                    default_model_options = [{"value": m, "label": m} for m in available_models]
            
            schema_dict = {
                vol.Required(
                    CONF_DEFAULT_PROVIDER, default=current_default_provider or (configured_providers[0] if configured_providers else DEFAULT_PROVIDER)
                ): SelectSelector(
                    SelectSelectorConfig(options=default_provider_options)
                ),
            }
            
            if default_model_options:
                schema_dict[vol.Optional(CONF_DEFAULT_MODEL, default=current_default_model)] = SelectSelector(
                    SelectSelectorConfig(options=default_model_options)
                )
            
            return self.async_show_form(
                step_id="init",
                data_schema=vol.Schema(schema_dict),
                description_placeholders={},
            )
        
        # Not first entry, show provider selection
        current_provider = self.config_entry.data.get("ai_provider", DEFAULT_PROVIDER)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "ai_provider", default=current_provider
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                {"value": k, "label": v} for k, v in PROVIDERS.items()
                            ]
                        )
                    ),
                }
            ),
            description_placeholders={"current_provider": PROVIDERS[current_provider]},
        )

    async def async_step_configure_options(self, user_input=None):
        """Handle the configuration step for the selected provider in options."""
        errors = {}
        provider = self.options_data["ai_provider"]
        current_provider = self.options_data["current_provider"]
        token_field = TOKEN_FIELD_NAMES[provider]
        token_label = TOKEN_LABELS[provider]

        # Get current configuration
        current_models = self.config_entry.data.get("models", {})
        # If provider changed, use default model for new provider
        # If same provider, use current model or default
        if provider == current_provider:
            current_model = current_models.get(provider, DEFAULT_MODELS[provider])
        else:
            # Provider changed, use default for new provider
            current_model = DEFAULT_MODELS[provider]
        
        # For Alter provider, if model is empty, default to "Custom..." for the dropdown
        if provider == "alter" and not current_model:
            current_model = "Custom..."
        current_token = self.config_entry.data.get(token_field, "")
        available_models = AVAILABLE_MODELS.get(provider, [DEFAULT_MODELS[provider]])

        # Always show current token (will be masked for password fields)
        display_token = current_token
        
        # Get current custom model if set
        current_custom_model = ""
        if current_models.get(provider):
            # Check if current model is in available models
            if current_models[provider] not in available_models:
                # It's a custom model
                current_custom_model = current_models[provider]
            elif current_model == "Custom..." and current_models.get(provider):
                # Model dropdown is set to Custom..., check if there's a custom model value
                current_custom_model = current_models[provider]

        if user_input is not None:
            try:
                token_value = user_input.get(token_field)
                if not token_value:
                    errors[token_field] = "required"
                else:
                    # Prepare the updated configuration
                    updated_data = dict(self.config_entry.data)
                    updated_data["ai_provider"] = provider
                    updated_data[token_field] = token_value

                    # Update model configuration
                    selected_model = user_input.get("model")
                    custom_model = user_input.get("custom_model")

                    # Initialize models dict if it doesn't exist
                    if "models" not in updated_data:
                        updated_data["models"] = {}

                    if custom_model and custom_model.strip():
                        # Use custom model if provided and not empty
                        updated_data["models"][provider] = custom_model.strip()
                    elif selected_model and selected_model != "Custom...":
                        # Use selected model if it's not the "Custom..." option
                        updated_data["models"][provider] = selected_model
                    else:
                        # For local and alter providers, allow empty model name
                        if provider in ("local", "alter"):
                            updated_data["models"][provider] = ""
                        else:
                            # Ensure we keep the current model or use default for other providers
                            if provider not in updated_data["models"]:
                                updated_data["models"][provider] = DEFAULT_MODELS[
                                    provider
                                ]

                    _LOGGER.debug(
                        f"Options flow - Final model config for {provider}: {updated_data['models'].get(provider)}"
                    )

                    # Update custom system prompt if provided
                    custom_prompt = user_input.get(CONF_CUSTOM_SYSTEM_PROMPT, "").strip()
                    if custom_prompt:
                        updated_data[CONF_CUSTOM_SYSTEM_PROMPT] = custom_prompt
                    elif CONF_CUSTOM_SYSTEM_PROMPT in updated_data:
                        # Remove if empty
                        del updated_data[CONF_CUSTOM_SYSTEM_PROMPT]

                    # Update the config entry
                    self.hass.config_entries.async_update_entry(
                        self.config_entry, data=updated_data
                    )

                    return self.async_create_entry(title="", data={})
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception in options flow")
                errors["base"] = "unknown"

        # Build schema for the selected provider in options
        if provider == "local":
            # For local provider, we need both URL and optional model name
            current_url = self.config_entry.data.get(CONF_LOCAL_URL, "")

            schema_dict = {
                vol.Required(CONF_LOCAL_URL, default=current_url): TextSelector(
                    TextSelectorConfig(type="text")
                ),
            }

            # Add model selection
            model_options = AVAILABLE_MODELS.get("local", ["Custom..."])
            schema_dict[
                vol.Optional(
                    "model", default=current_model if current_model else "Custom..."
                )
            ] = SelectSelector(SelectSelectorConfig(options=model_options))
            schema_dict[vol.Optional("custom_model", default=current_custom_model)] = TextSelector(
                TextSelectorConfig(type="text")
            )
            # Add custom system prompt field with current value
            current_prompt = self.config_entry.data.get(CONF_CUSTOM_SYSTEM_PROMPT, "")
            schema_dict[vol.Optional(CONF_CUSTOM_SYSTEM_PROMPT, default=current_prompt)] = TextSelector(
                TextSelectorConfig(type="text", multiline=True)
            )

            return self.async_show_form(
                step_id="configure_options",
                data_schema=vol.Schema(schema_dict),
                errors=errors,
                description_placeholders={
                    "token_label": "Local API URL",
                    "provider": PROVIDERS[provider],
                },
            )

        # Build schema for other providers
        schema_dict = {
            vol.Required(token_field, default=display_token): TextSelector(
                TextSelectorConfig(type="password")
            ),
        }

        # Add model selection if available
        if available_models:
            # Add predefined models + custom option (avoid duplicating "Custom...")
            if "Custom..." in available_models:
                model_options = available_models
            else:
                model_options = available_models + ["Custom..."]
            schema_dict[vol.Optional("model", default=current_model)] = SelectSelector(
                SelectSelectorConfig(options=model_options)
            )
            schema_dict[vol.Optional("custom_model", default=current_custom_model)] = TextSelector(
                TextSelectorConfig(type="text")
            )
        # Add custom system prompt field with current value
        current_prompt = self.config_entry.data.get(CONF_CUSTOM_SYSTEM_PROMPT, "")
        schema_dict[vol.Optional(CONF_CUSTOM_SYSTEM_PROMPT, default=current_prompt)] = TextSelector(
            TextSelectorConfig(type="text", multiline=True)
        )

        return self.async_show_form(
            step_id="configure_options",
            data_schema=vol.Schema(schema_dict),
            errors=errors,
            description_placeholders={
                "token_label": token_label,
                "provider": PROVIDERS[provider],
            },
        )
