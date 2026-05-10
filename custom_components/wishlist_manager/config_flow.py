"""Config flow for Wishlist Manager."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from .const import CONF_TITLE, DOMAIN


class WishlistManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick a title and finish."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is None:
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema(
                    {
                        vol.Optional(CONF_TITLE, default="Wishlist Manager"): str,
                    }
                ),
            )

        title = (user_input.get(CONF_TITLE) or "Wishlist Manager").strip()
        return self.async_create_entry(title=title, data={})
