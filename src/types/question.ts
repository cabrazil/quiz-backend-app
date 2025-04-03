export type Difficulty = 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL';

export interface Question {
  id: number;
  text: string;
  categoryId: number;
  difficulty: Difficulty;
  correctAnswer: string;
  options: string[];
  explanation?: string;
  source?: string;
  scrImage?: string;
  createdAt: Date;
  updatedAt: Date;
} 