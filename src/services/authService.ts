import { GoogleAuthConfig } from '../types/auth';

export class AuthService {
    private static instance: AuthService;
    private readonly googleAuthConfig: GoogleAuthConfig = {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        redirectUri: 'obsidian://groq-chat/auth/callback',
        scope: 'email profile'
    };

    private constructor() {}

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async initiateGoogleAuth(): Promise<void> {
        const params = new URLSearchParams({
            client_id: this.googleAuthConfig.clientId,
            redirect_uri: this.googleAuthConfig.redirectUri,
            response_type: 'code',
            scope: this.googleAuthConfig.scope,
            access_type: 'offline',
            prompt: 'consent'
        });

        window.open(
            `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
            '_blank'
        );
    }

    async handleAuthCallback(code: string): Promise<string> {
        try {
            const response = await fetch('https://api.groq.com/v1/oauth/google/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    client_id: this.googleAuthConfig.clientId,
                    redirect_uri: this.googleAuthConfig.redirectUri,
                    grant_type: 'authorization_code'
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка получения токена');
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            throw new Error('Ошибка при обработке авторизации');
        }
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            const response = await fetch('https://api.groq.com/v1/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

export const authService = AuthService.getInstance(); 