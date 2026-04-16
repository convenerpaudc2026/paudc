import { api, type AuthUser } from './api';
import { auth } from './firebase';

const readPlatformTokenFromHash = (): string | null => {
	const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
	const params = new URLSearchParams(hash);
	return params.get('token');
};

export const authApi = {
	async firebaseLogin(idToken: string): Promise<void> {
		const response = await api.auth.firebaseLogin(idToken);
		localStorage.setItem('auth_token', response.data.access_token);
	},

	async login(): Promise<void> {
		// For OIDC fallback
		await api.auth.login();
	},

	async logout(): Promise<void> {
		localStorage.removeItem('auth_token');
		// Sign out from Firebase
		try {
			await auth.signOut();
		} catch (error) {
			console.error('Error signing out from Firebase:', error);
		}
	},

	async getCurrentUser(): Promise<AuthUser> {
		const response = await api.auth.me();
		return response.data;
	},

	async completeCallback(): Promise<void> {
		const platformToken = readPlatformTokenFromHash();
		if (!platformToken) {
			throw new Error('Missing token from authentication callback.');
		}

		const exchange = await api.auth.exchangePlatformToken(platformToken);
		localStorage.setItem('auth_token', exchange.data.token);
	},
};
