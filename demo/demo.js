document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  // Демо-сообщения
  const demoMessages = [
    {
      role: 'assistant',
      content: 'Привет! Я демо-версия Groq Chat. Как я могу помочь вам сегодня?',
    },
  ];

  // Функция для добавления сообщения
  function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}`;

    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    contentElement.textContent = message.content;

    messageElement.appendChild(contentElement);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Функция для симуляции ответа ассистента
  function simulateResponse(userMessage) {
    const responses = [
      'Это демо-версия плагина. Для полной функциональности установите плагин в Obsidian.',
      'В полной версии вы получите доступ ко всем возможностям Groq API.',
      'Попробуйте установить плагин через Community Plugins в Obsidian.',
      'Узнайте больше о возможностях плагина на нашей GitHub странице.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Обработчик отправки сообщения
  function handleSend() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Добавляем сообщение пользователя
    addMessage({ role: 'user', content: message });
    messageInput.value = '';

    // Симулируем набор текста ассистентом
    setTimeout(() => {
      const response = simulateResponse(message);
      addMessage({ role: 'assistant', content: response });
    }, 1000);
  }

  // Инициализация демо
  demoMessages.forEach(addMessage);

  // Обработчики событий
  sendButton.addEventListener('click', handleSend);
  messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Добавляем стили для сообщений
  const style = document.createElement('style');
  style.textContent = `
        .message {
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            max-width: 80%;
        }

        .message.user {
            background: var(--primary-color);
            color: white;
            margin-left: auto;
        }

        .message.assistant {
            background: #f3f4f6;
            color: var(--text-color);
            margin-right: auto;
        }

        .message-content {
            word-wrap: break-word;
        }
    `;
  document.head.appendChild(style);
});
