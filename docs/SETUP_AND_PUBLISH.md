# Groq Chat Plugin Setup and Publishing Guide

## Environment Setup

### 1. Requirements

- Node.js 16+
- npm or yarn
- Git
- Obsidian 0.15.0+
- Groq API key

### 2. Supported Models

#### Production Models

- **Llama 3 70B Versatile**

  - Context: 128K tokens
  - Max response: 32,768 tokens
  - Recommended for: general tasks

- **Llama 3 8B Instant**

  - Context: 128K tokens
  - Max response: 8,192 tokens
  - Recommended for: quick responses

- **Mixtral 8x7B**

  - Context: 32K tokens
  - Recommended for: complex computations

- **Gemma 2 9B**

  - Context: 8K tokens
  - Recommended for: efficient processing

- **Whisper Large V3**
  - Max file size: 25 MB
  - Recommended for: audio transcription

#### Preview Models

- **Llama 3 90B Vision**

  - Image support
  - Context: 128K tokens
  - Max response: 8,192 tokens

- **Qwen 2.5 Coder 32B**
  - Specialization: code processing
  - Context: 128K tokens

## 1. Setting up Secret Keys

### 1.1. Getting GROQ_API_KEY

1. Go to [Groq Console](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Click "Create New Key"
5. Copy the generated key

### 1.2. Adding Secrets to GitHub

1. Go to your repository settings on GitHub
2. Select "Settings > Secrets and variables > Actions"
3. Click "New repository secret"
4. Add the following secrets:
   ```
   GROQ_API_KEY=your_groq_key
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
