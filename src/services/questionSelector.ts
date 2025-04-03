import { PrismaClient, Prisma } from '@prisma/client';

interface QuestionSelectorParams {
  totalQuestions: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  excludeLastDays?: number;
}

export class QuestionSelector {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async selectQuestions(params: QuestionSelectorParams): Promise<number[]> {
    const { totalQuestions, difficulty, excludeLastDays } = params;

    // Construir a query base
    const query = Prisma.sql`
      WITH RankedQuestions AS (
        SELECT 
          q.id,
          q.difficulty,
          qh."usedAt" as last_used_at,
          ROW_NUMBER() OVER (
            PARTITION BY q.id 
            ORDER BY qh."usedAt" DESC
          ) as rn
        FROM "Question" q
        LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
      )
      SELECT DISTINCT ON (q.id) 
        q.id,
        q.difficulty,
        qh."usedAt" as last_used_at
      FROM "Question" q
      LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
      ${difficulty ? Prisma.sql`WHERE q.difficulty = ${difficulty}` : Prisma.empty}
      ${excludeLastDays ? Prisma.sql`AND (qh."usedAt" IS NULL OR qh."usedAt" < NOW() - INTERVAL '${excludeLastDays} days')` : Prisma.empty}
      ORDER BY q.id, qh."usedAt" DESC
      LIMIT ${totalQuestions}
    `;

    const questions = await this.prisma.$queryRaw<any[]>(query);
    return questions.map(q => q.id);
  }
} 