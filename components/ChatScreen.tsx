import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { startChatSession, sendMessage, getAnalysis } from '../services/geminiService';
import { SendIcon, BrainCircuitIcon, UserIcon, KeyIcon } from './icons';
import { AnalysisResultCard } from './AnalysisResultCard';

interface ChatScreenProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const MIN_MESSAGES_FOR_ANALYSIS = 6; // 3 user, 3 model

const ChatScreen: React.FC<ChatScreenProps> = ({ apiKey, setApiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => {
    if (apiKey && !chatSession) {
      const initializeChat = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const session = startChatSession(apiKey);
          setChatSession(session);
          
          const initialResponse = await sendMessage(session, "Hello, introduce yourself and ask your first question.");
          setMessages([{ role: 'model', content: initialResponse }]);
        } catch (err) {
          setError("Failed to start session. Please check your API key.");
          // Clear the invalid key to allow the user to re-enter
          setApiKey(''); 
        } finally {
          setIsLoading(false);
        }
      };
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const modelResponse = await sendMessage(chatSession, currentInput);
      const aiMessage: ChatMessage = { role: 'model', content: modelResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnalysis = async () => {
    if (isLoading || !apiKey) return;
    setIsLoading(true);
    setError(null);
    
    // FIX: Explicitly type `thinkingMessage` as `ChatMessage` to avoid type inference issues.
    const thinkingMessage: ChatMessage = { role: 'model', content: "Synthesizing your profile and calculating future trajectories..." };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const result = await getAnalysis(apiKey, messages);
      const analysisMessage: ChatMessage = { 
        role: 'model',
        content: "Here is your detailed analysis.",
        analysis: result 
      };
      setMessages(prev => [...prev.slice(0, -1), analysisMessage]);
    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
    }
  };
  
  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-8 bg-gray-800/50 border border-purple-500/20 rounded-2xl animate-fadeIn">
        <KeyIcon className="w-12 h-12 text-purple-400 mb-4"/>
        <h2 className="text-2xl font-bold text-cyan-300">Enter Your Gemini API Key</h2>
        <p className="text-gray-400 text-center mt-2 mb-6">
          To begin, please provide your Google AI API key. Your key is stored securely in your browser's local storage.
        </p>
        <form onSubmit={handleKeySubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter your API key here..."
            className="w-full p-3 bg-gray-900/70 border-2 border-gray-600 rounded-full text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
          />
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-full disabled:opacity-50 hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50">
            Save and Continue
          </button>
        </form>
      </div>
    );
  }
  
  if (messages.length === 0 && isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-8 bg-gray-800/50 border border-purple-500/20 rounded-2xl animate-fadeIn">
            <BrainCircuitIcon className="w-12 h-12 text-purple-400 mb-4 animate-pulse"/>
            <h2 className="text-2xl font-bold text-cyan-300">Contacting FutureMind AI...</h2>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-gray-800/50 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-900/20 animate-fadeIn">
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
             msg.analysis 
              ? <AnalysisResultCard key={index} result={msg.analysis} />
              : (
                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                      <BrainCircuitIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-md p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-700 text-gray-200 rounded-bl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                   {msg.role === 'user' && (
                    <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              )
          ))}
          {isLoading && !messages.some(m=>m.analysis) && (
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                  <BrainCircuitIcon className="w-5 h-5 text-white" />
                </div>
              <div className="max-w-md p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t border-purple-500/20">
        {error && <p className="text-red-400 text-center mb-2">{error}</p>}
        <form onSubmit={handleSend} className="flex items-stretch gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full p-3 bg-gray-900/70 border-2 border-gray-600 rounded-full text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
            disabled={isLoading || !chatSession}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !chatSession}
            className="p-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleAnalysis}
            disabled={isLoading || messages.length < MIN_MESSAGES_FOR_ANALYSIS || !chatSession}
            className="px-4 bg-gray-700 text-cyan-300 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
            title="Requires a few messages to be exchanged for an accurate analysis"
          >
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;