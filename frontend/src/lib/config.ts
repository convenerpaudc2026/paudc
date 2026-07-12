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
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configuredUrl) {
        const parsedUrl = new URL(configuredUrl);
        if (import.meta.env.PROD && parsedUrl.protocol !== 'https:') {
            throw new Error('VITE_API_BASE_URL must use HTTPS in production');
        }
        return {
            API_BASE_URL: configuredUrl.replace(/\/$/, ''),
        };
    }

    if (import.meta.env.PROD) {
        throw new Error('VITE_API_BASE_URL must be configured in production');
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
