import React from 'react';

interface AppProps {
  title?: string;
}

const App: React.FC<AppProps> = ({ title = 'Groq Chat Plugin Demo' }) => {
  return (
    <div className="groq-chat-app">
      <header className="groq-chat-header">
        <h1>{title}</h1>
      </header>
      <main className="groq-chat-content">
        <p>Добро пожаловать в Groq Chat Plugin!</p>
        <p>Это демонстрационная версия плагина для интеграции Groq Chat.</p>
      </main>
    </div>
  );
};

export default App; 