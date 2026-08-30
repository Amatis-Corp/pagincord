# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-30

### Added
- Initial release of Pagincord
- Core pagination functionality for Discord.js v14+
- Support for both EmbedBuilder objects and plain EmbedData objects
- User restriction system with ephemeral error messages
- Smart button management with automatic disabling
- Optional select menu for direct page jumping
- Configurable idle timeout with graceful cleanup
- Memory-safe collector management
- Full TypeScript support with exported type definitions
- Support for both Message and CommandInteraction targets
- Custom button emoji support
- Delete-on-stop option
- Start-on-specific-page option
- Comprehensive documentation and examples

### Features
- ⏮️ First Page button
- ◀️ Previous Page button
- 🗑️ Stop/Delete button
- ▶️ Next Page button
- ⏭️ Last Page button
- 📋 Optional Select Menu for page jumping
- 🔒 User-based access control
- ⏱️ Configurable timeout management
- 💾 Automatic memory cleanup

### Technical
- Zero runtime dependencies (only discord.js as peer dependency)
- Built with tsup for optimal bundle size
- CommonJS and ESM support
- Full TypeScript definitions included
- Source maps included for debugging
