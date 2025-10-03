# PolyChat™ – Obsidian Plugin

[![Release](https://img.shields.io/github/v/release/semernyakov/polychat?style=flat-square&label=Release)](https://github.com/semernyakov/polychat/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/semernyakov/polychat/total?style=flat-square&label=Downloads)](https://github.com/semernyakov/polychat/releases)
[![License](https://img.shields.io/github/license/semernyakov/polychat?style=flat-square&label=License)](LICENSE)
[![Tests](https://img.shields.io/github/actions/workflow/status/semernyakov/polychat/ci.yml?branch=master&style=flat-square&label=Tests)](https://github.com/semernyakov/polychat/actions/workflows/ci.yml)
[![NPM](https://img.shields.io/npm/v/groq-poly-chat?style=flat-square&label=NPM)](https://www.npmjs.com/package/groq-poly-chat)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa?style=flat-square&label=Contributor%20Covenant)](CODE_OF_CONDUCT.md)

<!-- [![Coverage](https://img.shields.io/codecov/c/github/semernyakov/groq-chat-plugin?style=flat-square)](https://codecov.io/gh/semernyakov/groq-chat-plugin) -->

[Русская версия](docs/README.ru.md) | [English version](README.md)

A plugin for [Obsidian](https://obsidian.md) that integrates Groq's AI chat capabilities directly into your notes.

PolyChat is a powerful chat extension with support for AI models via the Groq API. Designed for flexibility and ease of use, it enables seamless communication with multiple models directly from your vault.

## Screenshots

**Main Interface**

![polychat-main.png](docs/polychat-main.png)

**Settings Interface**

![polychat-settings.png](docs/polychat-settings.png)

## Features

- Direct integration with Groq AI models
- Dynamic model list: models are updated in real-time, always fresh
- Model Info Dialog: detailed info for each model (name, description, developer, max tokens, release status, etc.)
- Support for text, vision (image), coder, and audio models
- Localized interface (English/Russian) - automatically detects Obsidian language
- Markdown formatting and code highlighting
- Mobile support
- Custom model selection with grouping by model owner
- Chat history with multiple storage options:
  - In-memory storage
  - localStorage
  - IndexedDB
  - File-based storage
- Configurable history length and loading behavior
- Context-aware responses
- Raw/Markdown source view toggle for assistant messages
- Configurable default display mode (tab or side panel)
- Support dialog with donation links
- Hotkeys and advanced settings
- Secure API key storage
- Temperature and max tokens configuration
- Batch model activation/deactivation
- Open source and community-driven

## Project Status

This project is actively maintained and developed. New features are added regularly, including dynamic model updates, vision/coder/audio support, and improved UI/UX. Automated tests and advanced model integrations (audio/image) are planned. Feedback and contributions are welcome!

### Supported Models (Current List)

- Allam 2 7B
- DeepSeek R1 Distill Llama 70B
- DeepSeek R1 Distill Qwen 32B
- Gemma 2 9B IT
- Llama 3.1 8B Instant
- Llama 3.2 1B Preview
- Llama 3.2 3B Preview
- Llama 3.3 70B SpecDec
- Llama 3.3 70B Versatile
- Llama Guard 3 8B
- Llama 3 70B
- Llama 3 8B
- Meta Llama 4 Maverick 17B 128E Instruct
- Mistral Saba 24B
- Qwen 2.5 32B
- Qwen 2.5 Coder 32B
- Qwen QwQ 32B

> See plugin settings for the full up-to-date list. Descriptions will be updated as soon as they become available.

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "PolyChat"
4. Install the plugin
5. Enable the plugin in Community Plugins

## Configuration

1. Get your API key from [Groq Console](https://console.groq.com)
2. Open plugin settings in Obsidian
3. Enter your API key
4. Configure additional settings as needed (Note: Settings have been updated, including options for default display mode and history storage. See plugin settings for details.)

## Usage

1. Open any note in Obsidian
2. Click the PolyChat icon in the sidebar
3. Select the model you want (models update in real time)
4. Start chatting with AI (text, code)
5. View model info any time via the Model Info Dialog

## Development

```bash
# Clone the repository
git clone https://github.com/semernyakov/polychat.git

# Install dependencies
npm install

# Build the plugin
npm run build

# Lint the code
npm run lint

# Check for obsolete models
npm run check-models -- --help
```

## Model Checking

The `check_obsolete_models.ts` script verifies if the plugin is using any obsolete Groq models and helps maintain compatibility with the latest available models.

### Quick Start (Recommended)

```bash
# Show help and available options
npm run check-models -- --help

# Check with custom plugin data path (Linux/macOS)
npm run check-models -- --plugin-data-dir=~/.config/obsidian/plugins/groq-chat-plugin/data

# Check with custom plugin data path (Windows)
npm run check-models -- --plugin-data-dir=%APPDATA%\\obsidian\\plugins\\groq-chat-plugin\\data

# List all available models (including deprecated ones)
npm run check-models -- --list-all

# Run with English output
npm run check-models -- --lang=en
```

### Additional Options

1. **Specify Obsidian config directory** (if you know the path to `.obsidian`):

   ```bash
   npm run check-models -- --config-dir=~/.config/obsidian
   ```

2. **Use environment variables** (useful for scripts):

   ```bash
   OBSIDIAN_VAULT_PATH=~/.config/obsidian \
   npm run check-models
   ```

3. **Development mode** (uses default paths):
   ```bash
   NODE_ENV=development npm run check-models
   ```

### Plugin Settings Location

Plugin settings are usually found in one of these locations:

- **Linux**: `~/.config/obsidian/plugins/groq-chat-plugin/data/settings.json`
- **Windows**: `%APPDATA%\\obsidian\\plugins\\groq-chat-plugin\\data\\settings.json`
- **macOS**: `~/Library/Application Support/obsidian/plugins/groq-chat-plugin/data/settings.json`

### What Does the Script Do?

1. Finds the plugin's settings file
2. Checks which models are specified in the settings
3. Compares them with the current list of available Groq models
4. Identifies deprecated models that should be replaced
5. Detects unknown models that aren't in the official list
6. Provides recommendations for model replacements when available

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security issues, please read our [Security Policy](SECURITY.md) and report any vulnerabilities responsibly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this plugin helpful, consider:

- [Starring the repository](https://github.com/semernyakov/polychat)
- [Sponsoring the development](https://yoomoney.ru/fundraise/194GT5A5R07.250321)
- [Reporting issues](https://github.com/semernyakov/polychat/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all changes.

---

Made with ❤️ for Obsidian Community,

[Support developer with YooMoney](https://yoomoney.ru/fundraise/194GT5A5R07.250321)
