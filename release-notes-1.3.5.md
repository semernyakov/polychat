## What's Changed in 1.3.5

### Added

- **Support Dialog**: New dialog component with donation links and contact information
  - YooMoney donation support
  - GitHub repository link
  - Telegram contact link
  - Keyboard shortcuts (ESC to close)
  - Click outside to close functionality
- **Enhanced Localization**:
  - Automatic language detection from Obsidian settings
  - Real-time language switching in settings without reload
  - Comprehensive translations for all UI elements
- **Model Management**:
  - Model grouping by owner in dropdown and settings table
  - Batch model activation/deactivation (Select All/Deselect All)
  - Visual preview status indicators for models
  - Improved model name casing display
- **History Service Improvements**:
  - Multiple storage methods: memory, localStorage, IndexedDB, file
  - Configurable history length with truncation
  - Better error handling and user notifications
  - IndexedDB support for large history storage
- **Settings Enhancements**:
  - Message tail limit configuration (last N messages on startup)
  - History load step configuration (batch loading)
  - Temperature slider with dynamic tooltip
  - Max tokens input with validation
  - Visual save confirmation icons
  - Improved settings layout and organization

### Changed

- **MessageInput Component**:
  - Auto-resizing textarea with CSS classes
  - Improved keyboard handling (Ctrl+Enter to send, Shift+Enter for new line)
  - Character/token counter with overflow indication
  - Better accessibility with ARIA labels
  - Composition event handling for IME support
- **Settings Tab**:
  - Removed language selector (now uses Obsidian's language)
  - Added language monitoring for automatic UI updates
  - Improved model refresh with loading spinner
  - Enhanced thanks block with compact link layout
  - Better visual feedback for all actions

### Fixed

- **ModelInfoDialog**:
  - Removed duplicate instance from ChatPanel
  - Enhanced model change tracking
  - Improved state management and reliability
  - Fixed TypeScript errors and improved type safety
  - Added proper key prop for re-renders
- Proper handling of model selection with grouped display
- Improved error messages and user feedback
- Better state management in settings
- Fixed model info dialog updates on model change

### Security

- Replaced all `innerHTML` usages with secure DOM API methods
- Updated network requests to use Obsidian's `requestUrl` for cross-platform compatibility

### Refactored

- **Code Organization**:
  - Moved all inline styles to CSS files
  - Implemented CSS variables for theming
  - Added consistent class naming conventions
  - Improved theme support
- **Settings UI**:
  - Moved table styles to CSS
  - Improved theme support in settings
  - Enhanced accessibility with proper semantic HTML
- New utility: `src/utils/domUtils.ts`
- Comprehensive CSS classes for better maintainability
- Improved error handling and user feedback

### Performance

- Reduced JavaScript bundle size
- Improved rendering performance
- Optimized style recalculations
- Optimized history loading with configurable batch sizes
- Improved settings rendering with language monitoring
- Better memory management for large histories

### Build

- Updated project dependencies
- Optimized build configuration
- Improved TypeScript configuration

**Note:** This release includes significant refactoring and new features with comprehensive improvements across the entire codebase.
