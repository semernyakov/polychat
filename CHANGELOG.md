# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Raw/Markdown source view toggle for assistant messages.
- Configurable default chat display mode (tab or side panel).
- Added IndexedDB support for chat history storage.

### Changed

- Refactored Markdown rendering using `react-markdown` and `rehype-raw` for better HTML support and hydration error fixes.
- History storage configuration (`storeHistory` removed, use `maxHistoryLength=0` to disable).
- Improved API key update logic in GroqService.
- Minor UI/UX improvements in settings.

### Fixed

- Fixed React hydration errors related to HTML tag nesting (e.g., `<figure>` inside `<p>`).
- Removed unused variables and empty CSS rules based on ESLint and CSSLint checks.

## [1.2.0] - 2024-03-20

### Added

- Support for new preview models:
  - Qwen 32B
  - DeepSeek Llama 70B
  - DeepSeek Qwen 32B
  - Llama 3 Vision models
- Improved chat interface
- Support for Obsidian mobile version
- New hotkeys

### Changed

- Simplified authorization process via API key
- Improved performance
- Optimized memory usage

### Fixed

- Issue with displaying long messages
- Error when saving settings
- Memory leak during prolonged use

## [1.1.0] - 2024-03-18

### Added

- Support for new models:
  - Llama 3 70B Versatile (128K context)
  - Llama 3 8B Instant (128K context)
  - Mixtral 8x7B (32K context)
  - Gemma 2 9B (8K context)
  - Llama Guard 3 8B (for security)
  - Whisper Large V3 (for audio)
  - Llama 3 90B Vision (image support)
  - Qwen 2.5 Coder 32B (for code)
  - Mistral Saba 24B
- Improved API error handling
- Audio transcription support
- Image analysis support
- Improved code handling

### Changed

- Updated settings interface
- Improved chat performance
- Optimized context handling

### Fixed

- Fixed issues with displaying long messages
- Improved connection stability
- Fixed errors in history handling

## [1.0.0] - 2024-03-01

### Added

- First public release
- Basic support for Groq models
- Interactive chat interface
- Saving chat history
- Interface settings
- Theme support
- Hotkeys

### Changed

- Performance optimization
- UI/UX improvements
- Documentation update

### Fixed

- Major beta version bugs
- Authorization issues
- Formatting errors

## [0.9.0] - 2023-12-15

### Added

- Beta version of the plugin
- Test integration with API
- Basic interface
- Logging system

### Changed

- Stability improvements
- Code optimization
- Preparation for release

### Fixed

- Critical errors
- Security issues
- Interface errors

---

## Types of changes

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities. 