
import React, { useState, useEffect } from 'react';
import { BrainCircuitIcon, DnaIcon, BarChartIcon, SearchIcon } from './icons';

const messages = [
  "Analyzing psychological patterns...",
  "Calibrating behavioral models...",
  "Mapping personality traits with OCEAN framework...",
  "Detecting cognitive biases in responses...",
  "Simulating voice-stress and tone map...",
  "Cross-referencing with global life trajectory data...",
  "Calculating statistical probabilities...",
  "Synthesizing prediction vectors...",
];

const icons = [
  <BrainCircuitIcon key="1" className="w-8 h-8 text-cyan-400" />,
  <DnaIcon key="2" className="w-8 h-8 text-purple-400" />,
  <SearchIcon key="3" className="w-8 h-8 text-cyan-400" />,
  <BarChartIcon key="4" className="w-8 h-8 text-purple-400" />,
];

const AnalysisScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/30 rounded-2xl border border-purple-500/20">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="absolute animate-orbit"
            style={{ animationDelay: `${index * -1.5}s`, transformOrigin: '80px' }}
          >
            <div className="animate-spin-reverse" style={{ animationDuration: '6s'}}>
             {icon}
            </div>
          </div>
        ))}
        <BrainCircuitIcon className="w-24 h-24 text-purple-500 animate-pulse-slow" />
      </div>
      
      <h2 className="text-3xl font-bold mt-8 text-cyan-300">Analysis in Progress</h2>
      <p className="text-lg text-gray-300 mt-2">
        Our AI is processing your unique psychological profile.
      </p>
      
      <div className="mt-8 text-xl font-medium text-white h-8 w-full text-center transition-opacity duration-500">
        <p key={messageIndex} className="animate-fadeInOut">{messages[messageIndex]}</p>
      </div>

      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit {
          animation: orbit 6s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(10px); }
            20%, 80% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInOut {
            animation: fadeInOut 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalysisScreen;
