## What's Changed

### Fixed
- **ModelInfoDialog**:
  - Removed duplicate instance from ChatPanel
  - Enhanced model change tracking
  - Improved state management and reliability
  - Fixed TypeScript errors and improved type safety
  - Added proper key prop for re-renders

### Security
- Replaced all `innerHTML` usages with secure DOM API methods
- Updated network requests to use Obsidian's `requestUrl` for cross-platform compatibility

### Refactored
- **Code Organization**:
  - Moved all inline styles to CSS files
  - Implemented CSS variables for theming
  - Added consistent class naming conventions
  - Improved theme support

### Changed
- **Settings UI**:
  - Moved table styles to CSS
  - Improved theme support in settings
  - Enhanced accessibility with proper semantic HTML

### Added
- New utility: `src/utils/domUtils.ts`
- Comprehensive CSS classes for better maintainability
- Improved error handling and user feedback

### Performance
- Reduced JavaScript bundle size
- Improved rendering performance
- Optimized style recalculations

### Build
- Updated project dependencies
- Optimized build configuration
- Improved TypeScript configuration

**Note:** This release includes significant refactoring with 15 files changed, 1,667 insertions, and 345 deletions.
