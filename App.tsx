import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ChatScreen from './components/ChatScreen';

type AppState = 'welcome' | 'chat';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // On app start, try to load the key from localStorage.
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeyUpdate = (newKey: string) => {
    const trimmedKey = newKey.trim();
    setApiKey(trimmedKey);
    // Persist the new key to localStorage.
    localStorage.setItem('gemini-api-key', trimmedKey);
  };

  const handleStartChat = () => {
    setAppState('chat');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-[95vh]">
        <Header />
        <main className="mt-8 flex-grow flex flex-col">
          {appState === 'welcome' && <WelcomeScreen onStart={handleStartChat} />}
          {appState === 'chat' && <ChatScreen apiKey={apiKey} setApiKey={handleApiKeyUpdate} />}
        </main>
      </div>
    </div>
  );
};

export default App;