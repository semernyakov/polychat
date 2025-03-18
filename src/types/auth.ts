export interface GoogleAuthConfig {
    clientId: string;
    redirectUri: string;
    scope: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    token?: string;
    error?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
} 