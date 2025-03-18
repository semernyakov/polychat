# Publishing Groq Chat Plugin

This guide describes the process of publishing the Groq Chat Plugin for Obsidian.

## Preparation for Publishing

### 1. Functionality Check

Before publishing, ensure all core features are working correctly:

#### Supported Models

- **Production Models**:

  - Llama 3 70B Versatile (128K context tokens)
  - Llama 3 8B Instant (128K context tokens)
  - Mixtral 8x7B (32K context tokens)
  - Gemma 2 9B (8K context tokens)
  - Llama Guard 3 8B (for security checks)
  - Whisper Large V3 (for audio processing)

- **Preview Models**:
  - Llama 3 90B Vision (image support)
  - Qwen 2.5 Coder 32B (for code processing)
  - Mistral Saba 24B
  - DeepSeek models

#### Core Functionality

- [ ] Google OAuth authentication
- [ ] Chat creation and management
- [ ] All supported models working
- [ ] Audio processing via Whisper
- [ ] Image handling via Vision models
- [ ] Code analysis via Coder models
- [ ] Chat history saving
- [ ] Interface settings
- [ ] Hotkeys

### 2. Check the structure of the project

Ensure that all necessary files are present in the root of the project:

```
groq-chat-plugin/
├── manifest.json         # Plugin metadata
├── package.json         # npm configuration
├── versions.json        # Version history
├── main.js             # Compiled plugin
├── styles.css          # Plugin styles
├── README.md           # Documentation
└── LICENSE             # MIT License
```

### 3. Check manifest.json

Ensure that the file `manifest.json` contains correct data:

```json
{
  "id": "groq-chat",
  "name": "Groq Chat",
  "author": "Ivan Semernyakov",
  "authorUrl": "https://github.com/semernyakov",
  "description": "Groq Chat Plugin for Obsidian with support for latest models",
  "repo": "semernyakov/groq-chat-plugin",
  "branch": "master"
}
```

### 4. Check package.json

Ensure that all necessary scripts are configured in `package.json`:

```json
{
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "version": "node version-bump.mjs && git add manifest.json versions.json",
    "publish": "npm run build && npm run test && npm run release"
  }
}
```

## Publishing Process

### 1. Release Preparation

1. Ensure all changes are committed:

   ```bash
   git status
   ```

2. Verify that all tests pass:

   ```bash
   npm run test
   ```

3. Verify project build:

   ```bash
   npm run build
   ```

4. Verify linting:
   ```bash
   npm run lint
   ```

### 2. Create Release

1. Update plugin version:

   ```bash
   npm version patch # for patch (1.0.0 -> 1.0.1)
   # or
   npm version minor # for minor version (1.0.0 -> 1.1.0)
   # or
   npm version major # for major version (1.0.0 -> 2.0.0)
   ```

2. Create release:

   ```bash
   npm run release
   ```

3. Push changes to repository:
   ```bash
   git push --follow-tags origin master
   ```

### 3. Publishing in Community Plugins

1. Fork the [obsidian-releases](https://github.com/obsidianmd/obsidian-releases) repository

2. Add plugin information to `community-plugins.json`:

   ```json
   {
     "id": "groq-chat",
     "name": "Groq Chat",
     "author": "Ivan Semernyakov",
     "description": "Groq Chat Plugin for Obsidian with support for latest models",
     "repo": "semernyakov/groq-chat-plugin",
     "branch": "master"
   }
   ```

3. Create Pull Request in obsidian-releases repository

### 4. Pre-PR Check

1. Verify plugin functionality in Obsidian:

   - Install plugin from local file
   - Verify main functionality
   - Verify operation on mobile devices

2. Ensure documentation is up-to-date:

   - README.md contains up-to-date information
   - All functions and settings are described
   - Installation and usage instructions are provided

3. Verify release files:
   - manifest.json contains correct version
   - versions.json is updated
   - main.js successfully built
   - styles.css contains all styles

## Post-Publishing

### 1. Monitoring

1. Follow issues in repository
2. Respond to user questions
3. Fix found bugs

### 2. Updates

1. Repeat release process for update
2. Update versions.json for new version
3. Create new release on GitHub

### 3. Support

1. Regularly update dependencies
2. Follow Obsidian API updates
3. Support compatibility with new Obsidian versions

## Useful Links

- [Obsidian Plugin Guidelines](https://docs.obsidian.md/Plugins/Getting+started/Plugin+guidelines)
- [Obsidian Releases Repository](https://github.com/obsidianmd/obsidian-releases)
- [Sample Plugin Repository](https://github.com/obsidianmd/obsidian-sample-plugin)

## Control List

- [ ] All necessary files are present
- [ ] manifest.json contains correct data
- [ ] versions.json is updated
- [ ] Tests pass successfully
- [ ] Build works without errors
- [ ] Documentation is up-to-date
- [ ] Plugin works on mobile devices
- [ ] Release created on GitHub
- [ ] Pull Request sent to obsidian-releases
