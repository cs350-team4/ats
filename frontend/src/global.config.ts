// The root of the api endpoint. No trailing slash.
export const API_ROOT = "http://localhost:8000";
// The time public key will be cached
export const PUBLIC_KEY_CACHE_TIME = 15 * 60 * 1000; // unit: ms
// Maximum number of prizes to pull from server
export const PRIZE_LIST_LIMIT = 1000000;
// Number of prizes per page
export const PRIZE_LIST_PAGE_LENGTH = 24;
// The time prize list will be cached
export const PRIZE_LIST_CACHE_TIME = 15 * 60 * 1000; // unit: ms
// The minimum time cached prize list will be used without refresh
export const PRIZE_LIST_STALE_TIME = 20 * 1000; // unit: ms

// Number of prizes per page
export const GAME_LIST_PAGE_LENGTH = 24;
// The time prize list will be cached
export const GAME_LIST_CACHE_TIME = 15 * 60 * 1000; // unit: ms
// The minimum time cached prize list will be used without refresh
export const GAME_LIST_STALE_TIME = 20 * 1000; // unit: ms
