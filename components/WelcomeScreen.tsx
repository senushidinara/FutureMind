import React from 'react';
import { DnaIcon, BarChartIcon, MicIcon, SearchIcon } from './icons';

interface WelcomeScreenProps {
  onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-500/20 text-center">
    <div className="flex justify-center mb-4 text-purple-400">{icon}</div>
    <h3 className="text-xl font-semibold text-cyan-300">{title}</h3>
    <p className="mt-2 text-gray-400">{description}</p>
  </div>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-4">Unlock Your Future Potential</h2>
      <p className="max-w-2xl text-lg text-gray-300 mb-8">
        Start a conversation with an AI life coach that combines psychological science and behavioral analytics to make scientifically accurate predictions about your life.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl mb-12">
        <FeatureCard icon={<DnaIcon className="w-8 h-8" />} title="Scientific Foundation" description="Based on proven psychological models like the Big Five personality traits." />
        <FeatureCard icon={<MicIcon className="w-8 h-8" />} title="Conversational AI" description="Engage in a natural conversation to uncover truths about yourself." />
        <FeatureCard icon={<SearchIcon className="w-8 h-8" />} title="Truth Detection" description="The AI analyzes your words to reveal hidden patterns and motivations." />
        <FeatureCard icon={<BarChartIcon className="w-8 h-8" />} title="Statistical Projection" description="Data patterns from millions of life histories inform your unique predictions." />
      </div>

      <button
        onClick={onStart}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg shadow-purple-500/30 hover:scale-105 transform transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50"
      >
        Start Conversation
      </button>
    </div>
  );
};

export default WelcomeScreen;