// Runtime configuration
export interface RuntimeConfig {
    API_BASE_URL?: string;
}

// Default configuration (fallback)
const defaultConfig = {
    API_BASE_URL: 'http://127.0.0.1:8000',
};

export function getConfig(): RuntimeConfig {
    // Prioritize Vite environment variables (baked at build time on Vercel)
    if (import.meta.env.VITE_API_BASE_URL) {
        return {
            API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        };
    }

    // Fallback to default
    return defaultConfig;
}

export function getAPIBaseURL(): string {
    return getConfig().API_BASE_URL || defaultConfig.API_BASE_URL;
}

export const config = {
    get API_BASE_URL() {
        return getAPIBaseURL();
    },
};