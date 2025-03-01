export const APP_CONFIG = {
  SOCKET: {
    URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
    TIMEOUT: 60000,
    PING_INTERVAL: 25000,
  },
  API: {
    URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
  GITHUB: {
    API_URL: 'https://api.github.com',
    DEFAULT_BRANCH: 'main',
    USERNAME: process.env.NEXT_PUBLIC_GITHUB_USERNAME || '',
  },
  EDITOR: {
    FONT_SIZE: 14,
    FONT_FAMILY: "'Fira Code', monospace",
    TAB_SIZE: 2,
    WORD_WRAP: 'on',
    MINIMAP: true,
    LINE_NUMBERS: true,
    SCROLL_BEYOND_LAST_LINE: false,
    CURSOR_SMOOTH_CARET_ANIMATION: true,
    CURSOR_BLINK_RATE: 530,
  },
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 200,
  },
  COLORS: {
    PRIMARY: '#0072f5',
    SUCCESS: '#17c964',
    WARNING: '#f5a524',
    ERROR: '#f31260',
  },
}; 