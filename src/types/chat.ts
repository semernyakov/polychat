export interface Message {
    text: string;
    sender: 'user' | 'groq';
    timestamp?: number;
    status?: 'sending' | 'sent' | 'error';
}

export interface ChatProps {
    plugin: GroqPlugin;
}

export interface ChatPanelState {
    messages: Message[];
    inputText: string;
    isLoading: boolean;
    selectedModel: GroqModel;
}

export interface ChatHistoryManager {
    saveMessages(messages: Message[]): void;
    loadMessages(): Message[];
    clearHistory(): void;
}

// Internal props for the chat panel component
export interface ChatPanelInternalProps {
    messages: Message[];
    inputText: string;
    isLoading: boolean;
    selectedModel: GroqModel;
    onInputChange: (text: string) => void;
    onSendMessage: () => Promise<void>;
    onModelChange: (model: GroqModel) => void;
    onClearHistory: () => void;
}