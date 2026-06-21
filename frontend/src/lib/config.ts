// Runtime configuration
export interface RuntimeConfig {
    API_BASE_URL?: string;
}

// Configuration loading state
let runtimeConfig: RuntimeConfig | null = null;
let configLoading = true;

// Default configuration (fallback)
const defaultConfig = {
    API_BASE_URL: 'http://127.0.0.1:8000', // Only used if runtime config fails to load
};

// Function to load runtime configuration
export async function loadRuntimeConfig(): Promise<void> {
    try {
        // console.log('DEBUG: Starting to load runtime config...');
        // Load from a specific config endpoint
        const response = await fetch('/api/config');
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            // Only parse as JSON if the response is actually JSON
            if (contentType && contentType.includes('application/json')) {
                runtimeConfig = await response.json();
            }
        }
    } catch (error) {
        console.error('Failed to load runtime configuration:', error);
    } finally {
        configLoading = false;
        // console.log('DEBUG: Config loading finished, configLoading set to false');
    }
}

export function getConfig(): RuntimeConfig {
    // Prioritize Vite environment variables (baked at build time on Vercel)
    if (import.meta.env.VITE_API_BASE_URL) {
        return {
            API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        };
    }

    if (runtimeConfig) {
        return runtimeConfig;
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