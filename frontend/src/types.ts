/** Minimal Home Assistant surface used by the panel. */

export interface HassConnection {
  sendMessagePromise(message: Record<string, unknown>): Promise<unknown>;
}

export interface HomeAssistant {
  connection: HassConnection;
  /** Home Assistant UI translations (user profile language). */
  localize?(key: string, ...args: unknown[]): string;
  /**
   * Authenticated fetch for REST calls (Home Assistant `HomeAssistantApi`).
   * Not on `hass.auth` — use this on `hass` directly.
   */
  fetchWithAuth?(
    input: string | URL,
    init?: RequestInit
  ): Promise<Response>;
  hassUrl?(path?: string): string;
  themes?: Record<
    string,
    { dark?: boolean; modes?: { dark?: Record<string, string> } }
  >;
  selectedTheme?: string | null;
  enabledThemes?: string[];
  locale?: { language?: string };
  callWS?: (msg: Record<string, unknown>) => Promise<unknown>;
}

export type ItemStatus = "desired" | "maybe" | "purchased";

export interface WishlistItemData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  external_url: string;
  notes: string;
  status: ItemStatus | string;
  price: number | null;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistData {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  sort_order: number;
  share_token: string | null;
  items: WishlistItemData[];
}

export interface StoreSnapshot {
  wishlists: WishlistData[];
  stats: {
    wishlist_count: number;
    total_items: number;
    purchased_items: number;
    desired_items: number;
    maybe_items: number;
    favorite_items: number;
    archived_items: number;
  };
}

export type SortMode = "newest" | "oldest" | "alpha" | "status";
