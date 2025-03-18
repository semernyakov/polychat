import '@testing-library/jest-dom';

// Mock services
jest.mock('../services/groqService', () => ({
  GroqService: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn().mockResolvedValue('Mock response'),
  })),
}));

jest.mock('../services/historyService', () => ({
  HistoryService: jest.fn().mockImplementation(() => ({
    loadMessages: jest.fn().mockResolvedValue([]),
    saveMessages: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    validateApiKey: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock utils
jest.mock('../utils/messageUtils', () => ({
  messageUtils: {
    createUserMessage: jest.fn(text => ({
      text,
      sender: 'user',
      timestamp: Date.now(),
    })),
    createGroqMessage: jest.fn(text => ({
      text,
      sender: 'groq',
      timestamp: Date.now(),
    })),
    truncateHistory: jest.fn(messages => messages),
  },
}));

jest.mock('../utils/apiUtils', () => ({
  apiUtils: {
    formatApiError: jest.fn(error => error.message || 'Unknown error'),
  },
}));

// Мок для scrollIntoView
Element.prototype.scrollIntoView = jest.fn();
