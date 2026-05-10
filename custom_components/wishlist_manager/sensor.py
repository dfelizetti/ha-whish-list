"""Sensors exposing wishlist aggregate statistics."""

from __future__ import annotations

from dataclasses import dataclass
from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api import WishlistApi
from .const import DOMAIN, SIGNAL_DATA_UPDATED


@dataclass(frozen=True, kw_only=True)
class WishlistSensorEntityDescription(SensorEntityDescription):
    """Describe a wishlist statistic sensor."""

    stat_key: str


SENSOR_TYPES: tuple[WishlistSensorEntityDescription, ...] = (
    WishlistSensorEntityDescription(
        key="total_items",
        translation_key="total_items",
        stat_key="total_items",
    ),
    WishlistSensorEntityDescription(
        key="purchased_items",
        translation_key="purchased_items",
        stat_key="purchased_items",
    ),
    WishlistSensorEntityDescription(
        key="desired_items",
        translation_key="desired_items",
        stat_key="desired_items",
    ),
    WishlistSensorEntityDescription(
        key="maybe_items",
        translation_key="maybe_items",
        stat_key="maybe_items",
    ),
    WishlistSensorEntityDescription(
        key="wishlist_count",
        translation_key="wishlist_count",
        stat_key="wishlist_count",
    ),
    WishlistSensorEntityDescription(
        key="favorite_items",
        translation_key="favorite_items",
        stat_key="favorite_items",
    ),
)


class WishlistStatisticSensor(SensorEntity):
    """A numeric statistic backed by the WishlistApi snapshot."""

    entity_description: WishlistSensorEntityDescription
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        api: WishlistApi,
        entry: ConfigEntry,
        description: WishlistSensorEntityDescription,
    ) -> None:
        self.entity_description = description
        self._api = api
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_DATA_UPDATED, self._handle_update
            )
        )
        self._update_state()

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self._entry.entry_id)},
            name=self._entry.title,
            manufacturer="Wishlist Manager",
            model="Wishlist Manager",
            entry_type=DeviceEntryType.SERVICE,
        )

    @callback
    def _handle_update(self) -> None:
        self._update_state()
        self.async_write_ha_state()

    def _update_state(self) -> None:
        stats = self._api.get_stats()
        key = self.entity_description.stat_key
        self._attr_native_value = stats.get(key, 0)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors from config entry."""
    api: WishlistApi | None = hass.data.get(DOMAIN, {}).get("api")
    if api is None:
        return
    async_add_entities(
        WishlistStatisticSensor(api, entry, desc) for desc in SENSOR_TYPES
    )
