import { Notice } from 'obsidian';
import { GroqPlugin } from '../types/plugin';

const AUTH_PORT = 53324;
const REDIRECT_URI = `http://localhost:${AUTH_PORT}/auth/callback`;

export class AuthService {
    private plugin: GroqPlugin;
    private server: any;

    constructor(plugin: GroqPlugin) {
        this.plugin = plugin;
    }

    async startAuthFlow() {
        await this.startLocalServer();
        
        const clientId = this.plugin.settings.googleClientId;
        const scope = 'email profile';
        
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('scope', scope);
        
        window.open(authUrl.toString(), '_blank');
    }

    private async startLocalServer() {
        if (this.server) {
            return;
        }

        try {
            const http = require('http');
            
            this.server = http.createServer((req: any, res: any) => {
                if (req.url?.startsWith('/auth/callback')) {
                    const html = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Авторизация Groq Chat</title>
                            <script>
                                window.onload = function() {
                                    const hash = window.location.hash.substring(1);
                                    const params = new URLSearchParams(hash);
                                    const accessToken = params.get('access_token');
                                    
                                    if (accessToken) {
                                        fetch('http://localhost:${AUTH_PORT}/token', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ token: accessToken })
                                        }).then(() => {
                                            document.body.innerHTML = '<h1>Авторизация успешна!</h1><p>Можете закрыть это окно.</p>';
                                        });
                                    } else {
                                        document.body.innerHTML = '<h1>Ошибка авторизации</h1><p>Попробуйте еще раз.</p>';
                                    }
                                }
                            </script>
                        </head>
                        <body>
                            <h1>Обработка авторизации...</h1>
                        </body>
                        </html>
                    `;
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                } else if (req.url === '/token' && req.method === 'POST') {
                    let body = '';
                    req.on('data', (chunk: any) => {
                        body += chunk.toString();
                    });
                    
                    req.on('end', async () => {
                        try {
                            const { token } = JSON.parse(body);
                            await this.handleToken(token);
                            res.writeHead(200);
                            res.end();
                        } catch (error) {
                            console.error('Error handling token:', error);
                            res.writeHead(500);
                            res.end();
                        }
                    });
                }
            });

            this.server.listen(AUTH_PORT, 'localhost');
        } catch (error) {
            console.error('Error starting local server:', error);
            new Notice('Ошибка запуска локального сервера авторизации');
        }
    }

    private async handleToken(token: string) {
        try {
            // Проверяем токен
            const isValid = await this.verifyToken(token);
            if (!isValid) {
                throw new Error('Invalid token');
            }

            // Сохраняем токен
            this.plugin.settings.googleToken = token;
            await this.plugin.saveSettings();
            
            new Notice('Авторизация успешна!');
        } catch (error) {
            console.error('Error handling token:', error);
            new Notice('Ошибка авторизации');
        }
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return !!data.email;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    }

    stopServer() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }
} 