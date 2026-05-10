import type { HomeAssistant } from "./types.js";

const DOMAIN = "wishlist_manager";

/**
 * Resolve a panel string from Home Assistant integration translations.
 * Keys live under `panel` in `translations/<lang>.json` and are exposed as
 * `component.wishlist_manager.panel.<subkey>`.
 *
 * HA uses the signed-in user's language (profile) with fallback to English.
 */
export function wmLoc(
  hass: HomeAssistant | undefined,
  subkey: string,
  fallback: string,
  params?: Record<string, string | number>
): string {
  if (!hass) return interpolate(fallback, params);
  const fullKey = `component.${DOMAIN}.panel.${subkey}`;
  let text = fallback;
  if (typeof hass.localize === "function") {
    try {
      const out = hass.localize(fullKey);
      if (typeof out === "string" && out !== fullKey) {
        text = out;
      }
    } catch {
      /* ignore */
    }
  }
  return interpolate(text, params);
}

function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;
  let s = text;
  for (const [k, v] of Object.entries(params)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
