
import React, { useState, useEffect, useRef } from 'react';
import { Answer } from '../types';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { MicIcon, StopCircleIcon, SendIcon } from './icons';

interface QuestionnaireProps {
  onComplete: (answers: Answer[]) => void;
  error: string | null;
}

const questions = [
  "Describe a recent challenge you faced and how you handled it.",
  "What is a skill you've always wanted to learn, and what has stopped you from starting?",
  "How do you typically behave in a large social gathering? Are you energized or drained by it?",
  "Describe a time you had to compromise with someone important to you. How did it make you feel?",
  "If you received a large, unexpected sum of money, what is the first responsible thing and the first irresponsible thing you would do?"
];

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, error }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentText, setCurrentText] = useState('');
  const { isRecording, startRecording, stopRecording, audioBlob } = useVoiceRecorder();
  const [isVoicePrompted, setIsVoicePrompted] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (currentText.trim() === '') return;

    const newAnswer: Answer = {
      question: questions[currentQuestionIndex],
      text: currentText,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentText('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      setIsVoicePrompted(true);
    }
  };

  useEffect(() => {
    if (!isRecording && audioBlob && isVoicePrompted) {
      setCurrentText(prev => prev + " (Voice input captured) ");
      setIsVoicePrompted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording]);


  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 bg-gray-800/50 border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-900/20 animate-fadeIn">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-cyan-300">
          <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>

      <div key={currentQuestionIndex} className="animate-fadeIn">
        <label className="text-2xl font-semibold text-gray-100 mb-4 block">
          {questions[currentQuestionIndex]}
        </label>
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Type your answer here, or use the microphone..."
          className="w-full h-40 p-4 bg-gray-900/70 border-2 border-gray-600 rounded-lg text-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 resize-none"
        />
      </div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleRecordClick}
          className={`p-3 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isRecording ? 'bg-red-500 text-white focus:ring-red-400' : 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={handleNext}
          disabled={currentText.trim() === ''}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-500/50 flex items-center gap-2"
        >
          <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Analysis'}</span>
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
