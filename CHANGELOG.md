# Changelog

## Highlights of v1.2.6

- Dynamic model updates, always up-to-date
- Support for new models (Vision, Coder, DeepSeek, and more)
- Improved ModelInfo dialog
- Vision/coder model support
- Minimalist Code of Conduct and Contributing (bilingual)
- YooMoney for supporting the author
- Documentation streamlined and updated

## Plans

- Automated tests are planned to improve stability and quality
- Support for models working with audio files and images (audio/vision) is planned

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.4] - 2025-05-20

### Added

- Enhanced error handling and logging
- Improved localization support
- Added proper translations for all UI elements
- Updated package name to groq-poly-chat
- Added better error messages and user notifications

### Changed

- Updated package name in all configuration files
- Improved UI consistency in different languages
- Enhanced error logging for better debugging

## [1.3.2] - 2025-05-19

### Added

- Minor improvements and optimizations for stability and performance.
- Updated dependencies and compatibility with latest Obsidian versions.
- UI/UX enhancements and localization updates.

### Fixed

- Bugfixes and minor corrections based on user feedback.

### Changed

- Documentation updates and code cleanup.
- Плагин переименован в PolyChat (ранее Groq Chat)
- Все ссылки обновлены на новый репозиторий: https://github.com/semernyakov/polychat
- Документация и инструкции обновлены под новое название
- Обновлены community-plugins.json и manifest.json

## [1.2.6] - 2025-04-27

### Latest

### Added

- Localized interface (English/Russian) for all user-facing strings.

## [1.2.6] - 2025-04-26

### Added

- Dynamic model updates: models list and info now refresh in real-time without reloading the plugin.
- General improvements and code optimizations for stability and performance.

## [1.2.5] - 2025-04-26

## [1.2.4] - 2025-03-18

## [1.2.3] - 2025-03-18

**Internal releases:**

- Refactoring of codebase and project structure.
- Documentation updates and localization improvements.
- Improvements to release workflow and CI/CD processes.

<!-- For details on earlier versions ([1.2.1-beta.2], [1.2.1-beta.1], [1.2.2], [1.2.1], [1.0.0]), see the previous changelog sections or request details. -->

- Model Info Dialog now shows only relevant fields: name, description (if present), developer, max tokens, release status, release/actuality date.
- Raw/Markdown source view toggle for assistant messages.
- Configurable default chat display mode (tab or side panel).
- Added IndexedDB support for chat history storage.

### Changed

- Refactored Markdown rendering using `react-markdown` and `rehype-raw` for better HTML support and hydration error fixes.
- History storage configuration (`storeHistory` removed, use `maxHistoryLength=0` to disable).
- Improved API key update logic in GroqService.
- Minor UI/UX improvements in settings.
- Updated badges in README files: all badges now use flat-square style, added Contributor Covenant badge with sharp corners, translated badge labels in Russian version.
- Updated contact email to beatuminflow@gmail.com in all documentation.
- Simplified and updated Code of Conduct (English and Russian).
- All Russian documentation is now located exclusively in the `docs` directory.

### Removed

- Deleted outdated or duplicate documentation files: CONTRIBUTING.md, CONTRIBUTING.ru.md, LICENSE.ru, AUTHOR.md, SECURITY.ru.md, docs/CODE_OF_CONDUCT.ru.md.
- Removed demo link from Russian README.

### Fixed

- Model Info Dialog now correctly updates information when switching models (state management bug fixed).
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
