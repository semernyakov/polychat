---
layout: default
title: Groq Chat Plugin for Obsidian
description: Integrate Groq's AI capabilities directly into your Obsidian notes
---

# Groq Chat Plugin for Obsidian

[![Release](https://img.shields.io/github/v/release/semernyakov/groq-chat-plugin?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/semernyakov/groq-chat-plugin/total?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/releases)
[![License](https://img.shields.io/github/license/semernyakov/groq-chat-plugin?style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/blob/master/LICENSE)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/semernyakov/groq-chat-plugin/ci.yml?branch=master&label=tests&style=flat-square)](https://github.com/semernyakov/groq-chat-plugin/actions)
[![Codecov](https://img.shields.io/codecov/c/github/semernyakov/groq-chat-plugin?style=flat-square)](https://codecov.io/gh/semernyakov/groq-chat-plugin)
[![npm](https://img.shields.io/npm/v/groq-chat-plugin?style=flat-square)](https://www.npmjs.com/package/groq-chat-plugin)

A powerful plugin for [Obsidian](https://obsidian.md) that integrates Groq's AI capabilities directly into your notes.

[Installation Guide](SETUP_AND_PUBLISH.md){: .button} [Documentation](PUBLISHING.md){: .button} [View Demo](demo/){: .button}

## Available Models

### Production Models

#### Large Language Models (LLMs)
- **Llama 3 70B Versatile**
  - Context: 128K tokens
  - Max response: 32,768 tokens
  - Best for: General tasks, complex reasoning, creative writing
  - Pricing: $0.0007/1K tokens

- **Llama 3 8B Instant**
  - Context: 128K tokens
  - Max response: 8,192 tokens
  - Best for: Quick responses, simple tasks
  - Pricing: $0.0001/1K tokens

- **Mixtral 8x7B**
  - Context: 32K tokens
  - Max response: 4,096 tokens
  - Best for: Multilingual tasks, code generation
  - Pricing: $0.0002/1K tokens

- **Gemma 2 9B**
  - Context: 8K tokens
  - Max response: 2,048 tokens
  - Best for: Efficient processing, lightweight applications
  - Pricing: $0.0001/1K tokens

#### Specialized Models
- **Llama Guard 3 8B**
  - Purpose: Content safety and moderation
  - Context: 128K tokens
  - Pricing: $0.0001/1K tokens

- **Whisper Large V3**
  - Purpose: Audio transcription
  - Max file size: 25 MB
  - Supported formats: mp3, wav, m4a
  - Pricing: $0.0001/second

### Preview Models (Beta)

- **Llama 3 90B Vision**
  - Features: Image understanding and analysis
  - Context: 128K tokens
  - Max response: 8,192 tokens
  - Image support: Yes
  - Status: Beta

- **Qwen 2.5 Coder 32B**
  - Purpose: Code generation and analysis
  - Context: 128K tokens
  - Languages: All major programming languages
  - Status: Beta

- **Mistral Saba 24B**
  - Purpose: General tasks with improved efficiency
  - Context: 32K tokens
  - Status: Beta

- **DeepSeek Models**
  - Purpose: Specialized tasks
  - Available variants: MoE, Coder
  - Status: Beta

## Core Features

- Real-time chat interface
- Markdown formatting
- Code highlighting
- Mobile support
- Custom model selection
- Chat history
- Context-aware responses

## Quick Start

1. Install the plugin from Obsidian Community Plugins
2. Get your API key from [Groq Console](https://console.groq.com)
3. Configure the plugin in Obsidian settings
4. Start chatting with AI!

## Documentation

- [Setup Guide](SETUP_AND_PUBLISH.md)
- [Usage Guide](PUBLISHING.md)
- [Security Policy](https://github.com/semernyakov/groq-chat-plugin/blob/master/SECURITY.md)
- [Contributing Guide](https://github.com/semernyakov/groq-chat-plugin/blob/master/CONTRIBUTING.md)

## Support

- [GitHub Issues](https://github.com/semernyakov/groq-chat-plugin/issues)
- [GitHub Discussions](https://github.com/semernyakov/groq-chat-plugin/discussions)
- [Sponsor the Project](https://github.com/sponsors/semernyakov)

## Live Demo

Try out the plugin features in our [live demo](demo/)!

---

[View on GitHub](https://github.com/semernyakov/groq-chat-plugin){: .button} 