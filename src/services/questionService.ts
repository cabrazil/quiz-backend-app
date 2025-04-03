import { Question, Difficulty } from '../types/question';
import { QUIZ_CONSTANTS } from '../constants/quiz';
import axios from 'axios';

// Pontuação por nível de dificuldade
const DIFFICULTY_POINTS = {
  'FÁCIL': 1,
  'MÉDIO': 2,
  'DIFÍCIL': 3
} as const;

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];
  private readonly API_URL = 'http://localhost:3000/api';

  private constructor() {}

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  public async fetchQuestions(category?: string, difficulty?: Difficulty): Promise<Question[]> {
    try {
      const response = await axios.get(`${this.API_URL}/questions`, {
        params: {
          category,
          difficulty,
          limit: QUIZ_CONSTANTS.DEFAULT_QUESTIONS
        }
      });

      return response.data.map((question: any) => ({
        id: question.id,
        text: question.text,
        categoryId: question.categoryId,
        difficulty: question.difficulty,
        correctAnswer: question.correctAnswer,
        options: question.options,
        explanation: question.explanation,
        createdAt: new Date(question.createdAt),
        updatedAt: new Date(question.updatedAt),
      }));
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      // Fallback para questões mockadas em caso de erro
      return this.getMockQuestions();
    }
  }

  public getRandomQuestions(questions: Question[], count: number = QUIZ_CONSTANTS.DEFAULT_QUESTIONS): Question[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public calculateScore(questions: Question[], answers: string[]): number {
    return answers.reduce((score, answer, index) => {
      const question = questions[index];
      const points = DIFFICULTY_POINTS[question.difficulty as keyof typeof DIFFICULTY_POINTS];
      return answer === question.correctAnswer ? score + points : score;
    }, 0);
  }

  private getMockQuestions(): Question[] {
    return [
      {
        id: 1,
        text: "Qual é a capital do Brasil?",
        categoryId: 22, // ID da categoria Geografia
        difficulty: "FÁCIL",
        correctAnswer: "Brasília",
        options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
        explanation: "Brasília é a capital do Brasil desde 1960...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        text: "Qual é o maior planeta do Sistema Solar?",
        categoryId: 17, // ID da categoria Ciência e Natureza
        difficulty: "MÉDIO",
        correctAnswer: "Júpiter",
        options: ["Saturno", "Júpiter", "Marte", "Terra"],
        explanation: "Júpiter é o maior planeta do Sistema Solar...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        text: "Quem pintou a Mona Lisa?",
        categoryId: 25, // ID da categoria Arte
        difficulty: "DIFÍCIL",
        correctAnswer: "Leonardo da Vinci",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        explanation: "A Mona Lisa foi pintada por Leonardo da Vinci...",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }
} 