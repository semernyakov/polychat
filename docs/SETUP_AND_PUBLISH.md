# Groq Chat Plugin Setup and Publishing Guide

## 1. Setting up Secret Keys

### 1.1. Getting GROQ_API_KEY
1. Go to [Groq Console](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Click "Create New Key"
5. Copy the generated key

### 1.2. Getting GOOGLE_CLIENT_ID
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable OAuth 2.0 API in "APIs & Services > Library"
4. Go to "APIs & Services > Credentials"
5. Click "Create Credentials > OAuth client ID"
6. Select "Web application" as application type
7. Add authorized redirect URIs:
   - `obsidian://groq-chat/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)
8. Copy the Client ID

### 1.3. Getting NPM_TOKEN
1. Sign up at [npmjs.com](https://www.npmjs.com)
2. Go to profile settings
3. Select "Access Tokens"
4. Create a new token with publish rights
5. Copy the token

### 1.4. Adding Secrets to GitHub
1. Go to your repository settings on GitHub
2. Select "Settings > Secrets and variables > Actions"
3. Click "New repository secret"
4. Add the following secrets:
   ```
   GROQ_API_KEY=your_groq_key
   GOOGLE_CLIENT_ID=your_client_id
   NPM_TOKEN=your_npm_token
   ```

## 2. Publishing to Official Obsidian Repository

### 2.1. Plugin Preparation
1. Ensure your plugin meets [Obsidian's requirements](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
2. Update `manifest.json`:
   ```json
   {
     "id": "groq-chat",
     "name": "Groq Chat",
     "version": "1.0.0",
     "minAppVersion": "1.0.0",
     "description": "Groq Chat Integration for Obsidian",
     "author": "Ivan Semernyakov",
     "authorUrl": "https://github.com/semernyakov",
     "isDesktopOnly": false
   }
   ```

### 2.2. Creating a Release
1. Create a new tag:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```
2. GitHub Actions will automatically create a release and publish to NPM

### 2.3. Submitting to Community Plugins
1. Fork the [obsidian-releases](https://github.com/obsidianmd/obsidian-releases) repository
2. Add your plugin information to `community-plugins.json`:
   ```json
   {
     "id": "groq-chat",
     "name": "Groq Chat",
     "author": "Ivan Semernyakov",
     "description": "Groq Chat Integration for Obsidian",
     "repo": "semernyakov/grok-chat-plugin",
     "branch": "master"
   }
   ```
3. Create a Pull Request to the obsidian-releases repository

### 2.4. Review and Publication
1. Wait for the Obsidian team to review your PR
2. Once approved, your plugin will appear in the Community Plugins catalog
3. Users can install the plugin via:
   - Settings > Community plugins > Browse
   - Search for "Groq Chat"
   - Click "Install" and "Enable"

## 3. Plugin Updates

### 3.1. Creating a New Release
1. Update version in `package.json` and `manifest.json`
2. Create a commit with changes:
   ```bash
   git add .
   git commit -m "feat: added new features"
   ```
3. Create a new tag:
   ```bash
   npm run release
   ```
4. GitHub Actions will automatically:
   - Create a release
   - Publish new version to NPM
   - Update documentation

### 3.2. Community Plugins Update
- Updates will happen automatically after creating a new release
- Users will receive a notification about available updates in Obsidian

## 4. Useful Development Commands

```bash
# Build project
npm run build

# Run tests
npm run test

# Run linter
npm run lint

# Create release
npm run release

# Publish to NPM
npm publish --access public
```

## 5. Important Notes

1. Always test the plugin before release
2. Follow [Semantic Versioning](https://semver.org/)
3. Update CHANGELOG.md
4. Keep documentation up to date
5. Respond to GitHub issues
6. Regularly update dependencies 