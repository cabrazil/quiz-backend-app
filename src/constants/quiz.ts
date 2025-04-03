export const QUIZ_CONSTANTS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  DEFAULT_QUESTIONS: 10,
  DEFAULT_EXCLUDE_DAYS: 90,
  DIFFICULTIES: ['FÁCIL', 'MÉDIO', 'DIFÍCIL'] as const,
  SOURCES: {
    TTA: 'TTA', // The Trivia API
    OTD: 'OTD'  // Open Trivia DB
  }
} as const; 