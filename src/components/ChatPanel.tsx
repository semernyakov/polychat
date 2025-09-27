import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GroqPluginInterface } from '../types/plugin';
import { Message } from '../types/types';
import { MessageUtils } from '../utils/messageUtils';
import { MessageList, MessageListHandles } from './MessageList';
import { ModelSelector } from './ModelSelector';
import { MessageInput } from './MessageInput';
import { SupportDialog } from './SupportDialog';
import {
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiHeart,
  FiSidebar,
  FiSquare,
  FiInfo,
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles.css';
import { ModelInfoDialog } from './ModelInfoDialog';
import { PluginSettingsProvider } from '../context/PluginSettingsContext';
import { t, Locale } from '../localization';
// import { DEFAULT_MODEL } from '../types/models'; // Удалено, если не используется
import { GroqModel, ModelCategory, ModelReleaseStatus } from '../types/types';

interface ChatPanelProps {
  plugin: GroqPluginInterface;
  displayMode: 'tab' | 'sidepanel';
  initialMessages?: Message[];
  onDisplayModeChange: (mode: 'tab' | 'sidepanel') => void;
}

interface LocalDynamicModelInfo {
  id: string;
  name: string;
  description?: string;
  category?: string;
  developer?: { name: string; url?: string };
  releaseStatus?: string;
  maxTokens?: number;
  tokensPerMinute?: number;
  requestsPerMinute?: number;
  maxDuration?: number;
  maxFileSize?: number;
}

interface ModelInfo {
  id: GroqModel;
  name: string;
  description: string;
  category: ModelCategory;
  developer: { name: string; url?: string };
  releaseStatus: ModelReleaseStatus;
  maxTokens: number;
  tokensPerMinute?: number;
  maxDuration?: number;
  maxFileSize?: number;
}

// Хук для управления сообщениями
const useMessages = (initialMessages: Message[], historyService: any) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  useEffect(() => {
    if (initialMessages.length > 0) {
      if (JSON.stringify(messages) !== JSON.stringify(initialMessages)) {
        setMessages(initialMessages);
      }
      setHasLoadedHistory(true);
      setIsHistoryLoading(false);
    } else if (!hasLoadedHistory) {
      const loadHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const history = await historyService.getHistory();
          setMessages(history);
          setHasLoadedHistory(true);
        } catch {
          // no-op
        } finally {
          setIsHistoryLoading(false);
        }
      };
      loadHistory();
    }
  }, [historyService, hasLoadedHistory, initialMessages]);

  const clearHistory = async () => {
    try {
      await historyService.clearHistory();
      setMessages([]);
      setHasLoadedHistory(true);
      toast.success(t('historyCleared'));
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error(t('historyClearError'));
    }
  };

  return { messages, setMessages, isHistoryLoading, clearHistory };
};

export const ChatPanel: React.FC<ChatPanelProps> = props => {
  const ChatPanelInner: React.FC = () => {
    const { plugin, displayMode, initialMessages = [], onDisplayModeChange } = props;
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Только активные модели
    const initialModels: LocalDynamicModelInfo[] = (plugin.settings.groqAvailableModels || [])
      .filter((m: any) => m.isActive !== false)
      .map((m: any) => ({ ...m }));
    const [availableModels, setAvailableModels] = useState<LocalDynamicModelInfo[]>(initialModels);

    // Выбираем модель из настроек, если она валидна, иначе первую активную
    const getInitialModel = () => {
      const modelFromSettings = plugin.settings.model;
      if (modelFromSettings && initialModels.find(m => m.id === modelFromSettings)) {
        return modelFromSettings;
      }
      return initialModels[0]?.id || GroqModel.LLAMA3_70B;
    };
    const [selectedModel, setSelectedModel] = useState<string>(getInitialModel());

    // Если выбранная модель исчезла из списка, сбрасываем на первую доступную
    // Если выбранная модель исчезла из списка, сбрасываем на первую доступную
    useEffect(() => {
      if (availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel)) {
        setSelectedModel(availableModels[0].id);
      }
    }, [availableModels]);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
    const [rateLimits, setRateLimits] = useState<any>(null);
    const messageListRef = useRef<MessageListHandles>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Определяем язык из настроек Obsidian (App API). Требуется minAppVersion: 1.8.0
    const appLang = (plugin.app as any)?.getLanguage?.();
    const locale: Locale = (
      appLang && appLang.toLowerCase().startsWith('ru') ? 'ru' : 'en'
    ) as Locale;

    const { messages, setMessages, isHistoryLoading, clearHistory } = useMessages(
      initialMessages,
      plugin.historyService,
    );

    // Динамическая тема
    useEffect(() => {
      const updateTheme = () => {
        const root = document.documentElement;
        const obsidianTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        root.setAttribute('data-groq-theme', obsidianTheme);
      };
      updateTheme();
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }, []);

    const fetchAvailableModels = useCallback(async (): Promise<LocalDynamicModelInfo[]> => {
      if (!plugin.groqService.getAvailableModelsWithLimits) return [];
      const { models, rateLimits } = await plugin.groqService.getAvailableModelsWithLimits();
      setRateLimits(rateLimits || {});
      const filtered = models.filter((m: any) => m.isActive !== false);
      setAvailableModels(filtered.map((m: any) => ({ ...m })));
      return filtered;
    }, [plugin.groqService]);

    useEffect(() => {
      fetchAvailableModels();
    }, [fetchAvailableModels]);

    // ResizeObserver
    useEffect(() => {
      const handleResize = () => {
        messageListRef.current?.forceUpdate();
      };
      const resizeObserver = new ResizeObserver(handleResize);
      const currentContainer = containerRef.current;
      if (currentContainer) {
        resizeObserver.observe(currentContainer);
      }
      return () => {
        if (currentContainer) {
          resizeObserver.unobserve(currentContainer);
        }
        resizeObserver.disconnect();
      };
    }, []);

    const handleScrollToTop = useCallback(() => {
      messageListRef.current?.scrollToTop();
    }, []);

    const handleScrollToBottom = useCallback(() => {
      messageListRef.current?.scrollToBottom();
    }, []);

    const handleSendMessage = useCallback(async () => {
      const trimmedValue = inputValue.trim();
      if (!trimmedValue || isLoading) return;

      const userMessage: Message = MessageUtils.create('user', trimmedValue);
      setInputValue('');
      setIsLoading(true);

      try {
        await plugin.historyService.addMessage(userMessage).catch(err => {
          console.error('Error saving user message:', err);
          toast.warn(t('messageSaveError'));
        });

        const assistantMessage = await plugin.groqService.sendMessage(trimmedValue, selectedModel);

        setMessages(prev => [...prev, userMessage, assistantMessage]);

        await plugin.historyService.addMessage(assistantMessage).catch(err => {
          console.error('Error saving assistant message:', err);
          toast.warn(t('assistantMessageSaveError'));
        });
      } catch (error: any) {
        console.error('Error sending message:', error);
        // Обработка ошибки terms acceptance
        if (
          error?.code === 'model_terms_required' ||
          error?.message?.includes('requires terms acceptance')
        ) {
          const link = `https://console.groq.com/playground?model=${selectedModel}`;
          toast.error(
            t('termsRequired', locale) +
              `\n${error?.message || ''}\n` +
              t('acceptTermsHere', locale) +
              `: ` +
              link,
            { autoClose: false },
          );
          const errorMessage = MessageUtils.create(
            'assistant',
            `${t('termsRequired', locale)}\n${error?.message || ''}\n${t('acceptTermsHere', locale)}: ${link}`,
          );
          setMessages(prev => [...prev, userMessage, errorMessage]);
          setIsLoading(false);
          return;
        }
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error(`${t('error')}: ${errorMsg}`);
        const errorMessage = MessageUtils.create('assistant', `${t('error')}: ${errorMsg}`);
        setMessages(prev => [...prev, userMessage, errorMessage]);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }, [inputValue, isLoading, plugin, selectedModel]);

    const handleModelChange = (modelId: string) => {
      setSelectedModel(modelId);
      plugin.settings.model = modelId;
      plugin.saveSettings();
    };

    const toggleDisplayMode = () => {
      const newMode = displayMode === 'tab' ? 'sidepanel' : 'tab';
      onDisplayModeChange(newMode);
    };

    const toModelInfo = (model: LocalDynamicModelInfo): ModelInfo => ({
      id: (Object.values(GroqModel).includes(model.id as GroqModel)
        ? model.id
        : GroqModel.LLAMA3_70B) as GroqModel,
      name: model.name,
      description: model.description || '',
      category: (model.category as ModelCategory) || 'text',
      developer: model.developer || { name: '' },
      releaseStatus: (model.releaseStatus as ModelReleaseStatus) || 'main',
      maxTokens: model.maxTokens || 4096,
      tokensPerMinute: model.tokensPerMinute,
      maxDuration: model.maxDuration,
      maxFileSize: model.maxFileSize,
    });

    const selectedModelInfo = toModelInfo(
      availableModels.find(m => m.id === selectedModel) ||
        availableModels[0] || { id: '', name: '', description: '' },
    );

    React.useEffect(() => {
      // console.log('[DEBUG] selectedModel:', selectedModel);
      // console.log('[DEBUG] availableModels:', availableModels);
      // console.log('[DEBUG] selectedModelInfo:', selectedModelInfo);
    }, [selectedModel, availableModels, selectedModelInfo]);

    if (!plugin.settings.apiKey) {
      return (
        <div className="groq-api-key-warning">{t('apiKeyMissing') || 'API key is missing'}</div>
      );
    }

    return (
      <div className={`groq-container groq-chat groq-chat--${displayMode}`} ref={containerRef}>
        <div className="groq-chat__header">
          <div className="groq-chat__header-left">
            <ModelSelector
              plugin={plugin}
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
              getAvailableModels={fetchAvailableModels}
              availableModels={availableModels}
            />
          </div>
          <div className="groq-chat__header-right">
            <button
              onClick={() => setIsModelInfoOpen(true)}
              className="groq-icon-button groq-model-info-button"
              title={t('modelInfo')}
              aria-label={t('modelInfo')}
            >
              <FiInfo size={16} />
            </button>
            {/* ModelInfoDialog has been moved to the bottom of the component */}
            <button
              onClick={toggleDisplayMode}
              className="groq-icon-button groq-display-mode-button"
              title={displayMode === 'tab' ? t('showInSidepanel') : t('showInTab')}
              aria-label={displayMode === 'tab' ? t('showInSidepanel') : t('showInTab')}
            >
              {displayMode === 'tab' ? <FiSidebar size={16} /> : <FiSquare size={16} />}
            </button>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="groq-icon-button groq-support-header-button"
              title={t('supportDevHeader')}
              aria-label={t('supportDevHeader')}
            >
              <FiHeart size={16} />
            </button>
            <button
              onClick={handleScrollToTop}
              className="groq-icon-button groq-scroll-button"
              title={t('scrollToTop')}
              aria-label={t('scrollToTop')}
              disabled={messages.length === 0}
            >
              <FiChevronUp size={16} />
            </button>
            <button
              onClick={handleScrollToBottom}
              className="groq-icon-button groq-scroll-button"
              title={t('scrollToBottom')}
              aria-label={t('scrollToBottom')}
              disabled={messages.length === 0}
            >
              <FiChevronDown size={16} />
            </button>
            <button
              onClick={clearHistory}
              className="groq-icon-button groq-clear-button"
              title={t('clearHistory')}
              aria-label={t('clearHistory')}
              disabled={messages.length === 0 || isLoading}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        <div className="groq-chat__content">
          <div className="groq-chat__messages-container">
            {rateLimits && (rateLimits.requestsPerDay || rateLimits.tokensPerMinute) && (
              <section className="groq-rate-limits">
                <b>{t('rateLimits')}:</b>
                {rateLimits.requestsPerDay !== undefined && (
                  <div>
                    {t('requestsPerDay')}:{' '}
                    <b>
                      {rateLimits.remainingRequests ?? '—'} / {rateLimits.requestsPerDay}
                    </b>
                    {rateLimits.resetRequests && (
                      <span>
                        ({t('reset')}: {rateLimits.resetRequests})
                      </span>
                    )}
                  </div>
                )}
                {rateLimits.tokensPerMinute !== undefined && (
                  <div>
                    {t('tokensPerMinute')}:{' '}
                    <b>
                      {rateLimits.remainingTokens ?? '—'} / {rateLimits.tokensPerMinute}
                    </b>
                    {rateLimits.resetTokens && (
                      <span>
                        ({t('reset')}: {rateLimits.resetTokens})
                      </span>
                    )}
                  </div>
                )}
              </section>
            )}
            <MessageList
              ref={messageListRef}
              messages={messages}
              isLoading={isLoading}
              language={locale}
            />
            {isHistoryLoading && (
              <div className="groq-chat__loading-history">
                <div className="groq-spinner"></div>
                <span>{t('loadingHistory')}</span>
              </div>
            )}
          </div>

          <div className="groq-chat__input-container">
            <MessageInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isLoading || isHistoryLoading}
              maxTokens={selectedModelInfo.maxTokens}
            />
          </div>
        </div>

        <SupportDialog isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        <ModelInfoDialog
          key={`${selectedModel}-${isModelInfoOpen}`}
          isOpen={isModelInfoOpen}
          onClose={() => setIsModelInfoOpen(false)}
          modelInfo={selectedModelInfo}
          isAvailable={availableModels.some(m => m.id === selectedModelInfo.id)}
        />

        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </div>
    );
  };

  return (
    <PluginSettingsProvider initialSettings={props.plugin.settings}>
      <ChatPanelInner />
    </PluginSettingsProvider>
  );
};
