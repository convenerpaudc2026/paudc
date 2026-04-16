import { getAPIBaseURL } from './config';

type QueryParams = {
	query?: Record<string, unknown>;
	sort?: string;
	skip?: number;
	limit?: number;
};

type ApiResponse<T> = {
	data: T;
};

export type AuthUser = {
	id: string;
	email: string;
	name?: string;
	role: string;
	last_login?: string;
};

export type Enrollment = {
	id: number;
	user_id: string;
	course_id: number;
	enrolled_at?: string;
	completed_at?: string;
	progress_percentage?: number;
	status: string;
};

export type Course = {
	id: number;
	title: string;
	description?: string;
	thumbnail_url?: string;
	difficulty_level: string;
	estimated_hours?: number;
	is_published?: boolean;
	created_by?: string;
};

const buildUrl = (path: string) => `${getAPIBaseURL()}${path}`;

const getAuthHeaders = (): HeadersInit => {
	const token = localStorage.getItem('auth_token');
	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
	const response = await fetch(buildUrl(path), {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
			...(init.headers || {}),
		},
	});

	if (!response.ok) {
		let message = `Request failed with status ${response.status}`;
		try {
			const payload = await response.json();
			if (payload?.detail && typeof payload.detail === 'string') {
				message = payload.detail;
			}
		} catch {
			// Ignore JSON parsing errors and use default message.
		}
		throw new Error(message);
	}

	if (response.status === 204) {
		return null as T;
	}

	return (await response.json()) as T;
};

const toListPath = (entityPath: string, params: QueryParams) => {
	const search = new URLSearchParams();
	if (params.query) {
		search.set('query', JSON.stringify(params.query));
	}
	if (params.sort) {
		search.set('sort', params.sort);
	}
	if (typeof params.skip === 'number') {
		search.set('skip', String(params.skip));
	}
	if (typeof params.limit === 'number') {
		search.set('limit', String(params.limit));
	}
	const query = search.toString();
	return `${entityPath}${query ? `?${query}` : ''}`;
};

export const api = {
	auth: {
		firebaseLogin: async (idToken: string): Promise<ApiResponse<{ access_token: string; token_type: string; user: AuthUser }>> => {
			const data = await request<{ access_token: string; token_type: string; user: AuthUser }>('/api/v1/auth/firebase/login', {
				method: 'POST',
				body: JSON.stringify({ id_token: idToken }),
			});
			return { data };
		},
		login: async (): Promise<void> => {
			window.location.href = buildUrl('/api/v1/auth/login');
		},
		me: async (): Promise<ApiResponse<AuthUser>> => {
			const data = await request<AuthUser>('/api/v1/auth/me');
			return { data };
		},
		getProfile: async (): Promise<ApiResponse<AuthUser>> => {
			const data = await request<AuthUser>('/api/v1/users/profile');
			return { data };
		},
		exchangePlatformToken: async (platformToken: string): Promise<ApiResponse<{ token: string }>> => {
			const data = await request<{ token: string }>('/api/v1/auth/token/exchange', {
				method: 'POST',
				body: JSON.stringify({ platform_token: platformToken }),
			});
			return { data };
		},
		logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
			localStorage.removeItem('auth_token');
			return { data: { success: true } };
		},
		toLogin: (): void => {
			window.location.href = '/login';
		},
	},
	entities: {
		courses: {
			query: async (params: QueryParams): Promise<ApiResponse<{ items: Course[]; total: number; skip: number; limit: number }>> => {
				const data = await request<{ items: Course[]; total: number; skip: number; limit: number }>(
					toListPath('/api/v1/entities/courses/', params)
				);
				return { data };
			},
		},
		enrollments: {
			query: async (
				params: QueryParams
			): Promise<ApiResponse<{ items: Enrollment[]; total: number; skip: number; limit: number }>> => {
				const data = await request<{ items: Enrollment[]; total: number; skip: number; limit: number }>(
					toListPath('/api/v1/entities/enrollments/', params)
				);
				return { data };
			},
			create: async (payload: { course_id: number; status: string }): Promise<ApiResponse<Enrollment>> => {
				const data = await request<Enrollment>('/api/v1/entities/enrollments/', {
					method: 'POST',
					body: JSON.stringify(payload),
				});
				return { data };
			},
		},
	},
};