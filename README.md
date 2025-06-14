# PolyChat Plugin for Obsidian

[![Release](https://img.shields.io/github/v/release/semernyakov/polychat?style=flat-square)](https://github.com/semernyakov/polychat/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/semernyakov/polychat/total?style=flat-square)](https://github.com/semernyakov/polychat/releases)
[![License](https://img.shields.io/github/license/semernyakov/polychat?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/github/actions/workflow/status/semernyakov/polychat/ci.yml?branch=master&style=flat-square)](https://github.com/semernyakov/polychat/actions/workflows/ci.yml)
[![NPM](https://img.shields.io/npm/v/groq-poly-chat?style=flat-square)](https://www.npmjs.com/package/groq-poly-chat)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa?style=flat-square)](CODE_OF_CONDUCT.md)

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
- Localized interface (English/Russian)
- Markdown formatting and code highlighting
- Mobile support
- Custom model selection
- Chat history with IndexedDB/localStorage/file options
- Context-aware responses
- Raw/Markdown source view toggle for assistant messages
- Configurable default display mode (tab or side panel)
- Hotkeys and advanced settings
- Secure API key storage
- Open source and community-driven

## Project Status

This project is actively maintained and developed. New features are added regularly, including dynamic model updates, vision/coder/audio support, and improved UI/UX. Automated tests and advanced model integrations (audio/image) are planned. Feedback and contributions are welcome!

### Supported Models (Current List)

- "deepseek-r1-distill-llama-70b"
- "llama-guard-3-8b"
- "distil-whisper-large-v3-en"
- "deepseek-r1-distill-llama-70b"
- "meta-llama/llama-4-scout-17b-16e-instruct"
- "llama-3.1-8b-instant"
- "whisper-large-v3"
- "playai-tts"
- "meta-llama/llama-prompt-guard-2-22m"
- "qwen-qwq-32b"
- "meta-llama/llama-guard-4-12b"
- "meta-llama/llama-4-maverick-17b-128e-instruct"
- "mistral-saba-24b"
- "llama-3.3-70b-versatile"
- "compound-beta"
- "llama3-8b-8192"
- "meta-llama/llama-prompt-guard-2-86m"
- "playai-tts-arabic"
- "gemma2-9b-it"
- "compound-beta-mini"
- "llama3-70b-8192"
- "qwen/qwen3-32b"
- "allam-2-7b"
- "whisper-large-v3-turbo"

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

# Start development server
npm run dev

# Build the plugin
npm run build

# Check code style
npm run lint
```

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

See [CHANGELOG.ru.md](CHANGELOG.ru.md) for all changes.

---

Made with ❤️ for Obsidian Community,

[Support developer with YooMoney](https://yoomoney.ru/fundraise/194GT5A5R07.250321)
