export interface GoogleAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    token?: string;
    error?: string;
}