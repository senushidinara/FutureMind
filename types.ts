// FIX: Added Answer interface for use in Questionnaire.tsx
export interface Answer {
  question: string;
  text: string;
}

export interface Prediction {
  area: string;
  probability: number;
  outlook: string;
}

export interface AnalysisResult {
  personalitySummary: {
    title: string;
    description: string;
    traits: {
      trait: string;
      level: string;
      description: string;
    }[];
  };
  predictions: Prediction[];
  behavioralInsights: {
    title: string;
    insights: string[];
  };
  // FIX: Added truthDetection to match its usage in ResultsScreen.tsx
  truthDetection: {
    title: string;
    analysis: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  analysis?: AnalysisResult;
}