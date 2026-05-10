"""Wishlist Manager integration for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .api import WishlistApi
from .const import (
    ATTR_ARCHIVED,
    ATTR_COLOR,
    ATTR_DESCRIPTION,
    ATTR_EXTERNAL_URL,
    ATTR_FAVORITE,
    ATTR_ICON,
    ATTR_IMAGE_URL,
    ATTR_ITEM_ID,
    ATTR_NAME,
    ATTR_NOTES,
    ATTR_PRICE,
    ATTR_STATUS,
    ATTR_TAGS,
    ATTR_TITLE,
    ATTR_URL,
    ATTR_WISHLIST_ID,
    DOMAIN,
)
from .http_api import register_http_views
from .websocket_api import async_register_websocket_handlers

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

STATIC_URL_PATH = "/wishlist_manager_panel"
WEBCOMPONENT_NAME = "wishlist-manager-panel"
PANEL_URL = "wishlist-manager"

SERVICE_ADD_ITEM = "add_item"
SERVICE_UPDATE_ITEM = "update_item"
SERVICE_REMOVE_ITEM = "remove_item"
SERVICE_SET_STATUS = "set_status"
SERVICE_CREATE_WISHLIST = "create_wishlist"
SERVICE_UPDATE_WISHLIST = "update_wishlist"
SERVICE_DELETE_WISHLIST = "delete_wishlist"
SERVICE_FETCH_METADATA = "fetch_metadata"

CONFIG_SCHEMA = vol.Schema({vol.Optional(DOMAIN): vol.Schema({})}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Integration bootstrap (configuration.yaml not required)."""
    return True


def _get_api(hass: HomeAssistant) -> WishlistApi:
    block = hass.data.get(DOMAIN)
    if not block or "api" not in block:
        raise ValueError("Wishlist Manager API is not available")
    return block["api"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from a config entry."""
    api = WishlistApi(hass)
    await api.async_load()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["api"] = api

    if not hass.data[DOMAIN].get("ha_routes_registered"):
        register_http_views(hass)
        async_register_websocket_handlers(hass)
        hass.data[DOMAIN]["ha_routes_registered"] = True

    integration_dir = Path(__file__).parent
    www_dir = integration_dir / "www"
    if www_dir.is_dir() and not hass.data[DOMAIN].get("static_registered"):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    STATIC_URL_PATH,
                    str(www_dir),
                    cache_headers=True,
                )
            ]
        )
        hass.data[DOMAIN]["static_registered"] = True
    elif not www_dir.is_dir():
        _LOGGER.warning(
            "Frontend bundle missing at %s — run frontend build (npm run build)",
            www_dir,
        )

    if not hass.data[DOMAIN].get("panel_registered"):
        try:
            from homeassistant.components.panel_custom import async_register_panel

            await async_register_panel(
                hass,
                frontend_url_path=PANEL_URL,
                webcomponent_name=WEBCOMPONENT_NAME,
                sidebar_title=entry.title,
                sidebar_icon="mdi:gift-outline",
                module_url=f"{STATIC_URL_PATH}/wishlist-manager-panel.js",
                config={"wishlist_manager": True},
                require_admin=False,
            )
            hass.data[DOMAIN]["panel_registered"] = True
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Failed to register sidebar panel: %s", err)

    await _async_register_services(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop("api", None)
    return unload_ok


async def _async_register_services(hass: HomeAssistant) -> None:
    """Register service handlers once."""
    if hass.services.has_service(DOMAIN, SERVICE_ADD_ITEM):
        return

    async def add_item(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        item = await api.async_create_item(
            call.data[ATTR_WISHLIST_ID],
            call.data[ATTR_TITLE],
            description=call.data.get(ATTR_DESCRIPTION, ""),
            image_url=call.data.get(ATTR_IMAGE_URL, ""),
            external_url=call.data.get(ATTR_EXTERNAL_URL, ""),
            notes=call.data.get(ATTR_NOTES, ""),
            status=call.data.get(ATTR_STATUS, "desired"),
            price=call.data.get(ATTR_PRICE),
            tags=call.data.get(ATTR_TAGS),
            favorite=call.data.get(ATTR_FAVORITE, False),
            archived=call.data.get(ATTR_ARCHIVED, False),
        )
        if not item:
            raise ValueError("Wishlist not found")
        return {"item": item.to_dict()}

    async def update_item(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        skip = {ATTR_WISHLIST_ID, ATTR_ITEM_ID}
        fields = {k: v for k, v in call.data.items() if k not in skip}
        item = await api.async_update_item(
            call.data[ATTR_WISHLIST_ID],
            call.data[ATTR_ITEM_ID],
            **fields,
        )
        if not item:
            raise ValueError("Item not found")
        return {"item": item.to_dict()}

    async def remove_item(call: ServiceCall) -> None:
        api = _get_api(hass)
        ok = await api.async_delete_item(
            call.data[ATTR_WISHLIST_ID], call.data[ATTR_ITEM_ID]
        )
        if not ok:
            raise ValueError("Item not found")

    async def set_status(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        item = await api.async_set_item_status(
            call.data[ATTR_WISHLIST_ID],
            call.data[ATTR_ITEM_ID],
            call.data[ATTR_STATUS],
        )
        if not item:
            raise ValueError("Item not found")
        return {"item": item.to_dict()}

    async def create_wishlist(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        wl = await api.async_create_wishlist(
            call.data[ATTR_NAME],
            icon=call.data.get(ATTR_ICON, "mdi:gift-outline"),
            color=call.data.get(ATTR_COLOR),
        )
        return {"wishlist": wl.to_dict()}

    async def update_wishlist(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        wl = await api.async_update_wishlist(
            call.data[ATTR_WISHLIST_ID],
            name=call.data.get(ATTR_NAME),
            icon=call.data.get(ATTR_ICON),
            color=call.data.get(ATTR_COLOR),
        )
        if not wl:
            raise ValueError("Wishlist not found")
        return {"wishlist": wl.to_dict()}

    async def delete_wishlist(call: ServiceCall) -> None:
        api = _get_api(hass)
        ok = await api.async_delete_wishlist(call.data[ATTR_WISHLIST_ID])
        if not ok:
            raise ValueError("Wishlist not found")

    async def fetch_metadata(call: ServiceCall) -> dict[str, Any]:
        api = _get_api(hass)
        return await api.async_fetch_metadata(call.data[ATTR_URL])

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ITEM,
        add_item,
        schema=vol.Schema(
            {
                vol.Required(ATTR_WISHLIST_ID): cv.string,
                vol.Required(ATTR_TITLE): cv.string,
                vol.Optional(ATTR_DESCRIPTION): cv.string,
                vol.Optional(ATTR_IMAGE_URL): cv.string,
                vol.Optional(ATTR_EXTERNAL_URL): cv.string,
                vol.Optional(ATTR_NOTES): cv.string,
                vol.Optional(ATTR_STATUS): cv.string,
                vol.Optional(ATTR_PRICE): vol.Any(float, int),
                vol.Optional(ATTR_TAGS): vol.All(cv.ensure_list, [cv.string]),
                vol.Optional(ATTR_FAVORITE): cv.boolean,
                vol.Optional(ATTR_ARCHIVED): cv.boolean,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_ITEM,
        update_item,
        schema=vol.Schema(
            {
                vol.Required(ATTR_WISHLIST_ID): cv.string,
                vol.Required(ATTR_ITEM_ID): cv.string,
                vol.Optional(ATTR_TITLE): cv.string,
                vol.Optional(ATTR_DESCRIPTION): cv.string,
                vol.Optional(ATTR_IMAGE_URL): cv.string,
                vol.Optional(ATTR_EXTERNAL_URL): cv.string,
                vol.Optional(ATTR_NOTES): cv.string,
                vol.Optional(ATTR_STATUS): cv.string,
                vol.Optional(ATTR_PRICE): vol.Any(float, int, None),
                vol.Optional(ATTR_TAGS): vol.All(cv.ensure_list, [cv.string]),
                vol.Optional(ATTR_FAVORITE): cv.boolean,
                vol.Optional(ATTR_ARCHIVED): cv.boolean,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_ITEM,
        remove_item,
        schema=vol.Schema(
            {
                vol.Required(ATTR_WISHLIST_ID): cv.string,
                vol.Required(ATTR_ITEM_ID): cv.string,
            }
        ),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_STATUS,
        set_status,
        schema=vol.Schema(
            {
                vol.Required(ATTR_WISHLIST_ID): cv.string,
                vol.Required(ATTR_ITEM_ID): cv.string,
                vol.Required(ATTR_STATUS): cv.string,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_WISHLIST,
        create_wishlist,
        schema=vol.Schema(
            {
                vol.Required(ATTR_NAME): cv.string,
                vol.Optional(ATTR_ICON): cv.string,
                vol.Optional(ATTR_COLOR): cv.string,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_WISHLIST,
        update_wishlist,
        schema=vol.Schema(
            {
                vol.Required(ATTR_WISHLIST_ID): cv.string,
                vol.Optional(ATTR_NAME): cv.string,
                vol.Optional(ATTR_ICON): cv.string,
                vol.Optional(ATTR_COLOR): cv.string,
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_WISHLIST,
        delete_wishlist,
        schema=vol.Schema({vol.Required(ATTR_WISHLIST_ID): cv.string}),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_FETCH_METADATA,
        fetch_metadata,
        schema=vol.Schema({vol.Required(ATTR_URL): cv.string}),
        supports_response=SupportsResponse.ONLY,
    )
