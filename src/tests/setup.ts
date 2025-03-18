import '@testing-library/jest-dom';

// Mock services
jest.mock('../services/groqService', () => ({
    groqService: {
        sendMessage: jest.fn()
    }
}));

jest.mock('../services/historyService', () => ({
    historyService: {
        loadMessages: jest.fn().mockResolvedValue([]),
        saveMessages: jest.fn().mockResolvedValue(undefined),
        clearHistory: jest.fn().mockResolvedValue(undefined)
    }
}));

// Mock utils
jest.mock('../utils/messageUtils', () => ({
    messageUtils: {
        createUserMessage: jest.fn((text) => ({
            text,
            sender: 'user',
            timestamp: Date.now()
        })),
        createGroqMessage: jest.fn((text) => ({
            text,
            sender: 'groq',
            timestamp: Date.now()
        })),
        truncateHistory: jest.fn((messages) => messages)
    }
}));

jest.mock('../utils/apiUtils', () => ({
    apiUtils: {
        formatApiError: jest.fn((error) => error.message || 'Unknown error')
    }
}));

// Мок для scrollIntoView
Element.prototype.scrollIntoView = jest.fn();