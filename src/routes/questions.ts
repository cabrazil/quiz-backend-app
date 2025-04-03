import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { QuestionSelector } from '../services/questionSelector.js';

const router = Router();
const prisma = new PrismaClient();
const questionSelector = new QuestionSelector();

// Rota para listar questões com filtros opcionais
router.get('/', async (req, res) => {
  console.log('[GET /api/questions] Iniciando processamento...');
  try {
    const { categoryId, difficulty, limit = 50 } = req.query;
    console.log('[GET /api/questions] Parâmetros recebidos:', { categoryId, difficulty, limit });

    // Construir a query base
    const where: Prisma.QuestionWhereInput = {};
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }
    
    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    // Buscar questões
    const questions = await prisma.question.findMany({
      where,
      include: {
        category: true
      },
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar questões para o frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: q.category.name,
      categoryId: q.categoryId,
      difficulty: q.difficulty,
      explanation: q.explanation,
      source: q.source,
      scrImage: q.scrImage
    }));

    console.log('[GET /api/questions] Questões encontradas:', formattedQuestions.length);
    res.json(formattedQuestions);
  } catch (error) {
    console.error('[GET /api/questions] Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar questões selecionadas ativas
router.get('/selected', async (req, res) => {
  console.log('[GET /api/questions/selected] Iniciando busca de questões selecionadas...');
  try {
    const selectedQuestions = await prisma.selectedQuestions.findFirst({
      where: { isActive: true }
    });

    console.log('[GET /api/questions/selected] Seleção encontrada:', selectedQuestions);

    if (!selectedQuestions) {
      console.log('[GET /api/questions/selected] Nenhuma seleção ativa encontrada');
      return res.json([]);
    }

    // Busca as questões completas
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: selectedQuestions.questionIds
        }
      },
      include: {
        category: true
      }
    });

    console.log('[GET /api/questions/selected] Questões encontradas:', questions.length);

    // Formata as questões para o frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: q.category.name,
      categoryId: q.categoryId,
      difficulty: q.difficulty,
      explanation: q.explanation,
      source: q.source,
      scrImage: q.scrImage,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));

    console.log('[GET /api/questions/selected] Questões formatadas:', formattedQuestions.length);
    res.json(formattedQuestions);
  } catch (error) {
    console.error('[GET /api/questions/selected] Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para salvar questões selecionadas
router.post('/selected', async (req, res) => {
  console.log('[POST /api/questions/selected] Iniciando processamento...');
  try {
    const { questionIds } = req.body;
    console.log('[POST /api/questions/selected] Recebendo questionIds:', questionIds);

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      console.log('[POST /api/questions/selected] Erro: questionIds inválido');
      return res.status(400).json({ error: 'IDs das questões são obrigatórios' });
    }

    // Desativa todas as seleções anteriores
    console.log('[POST /api/questions/selected] Desativando seleções anteriores...');
    await prisma.selectedQuestions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Cria nova seleção
    console.log('[POST /api/questions/selected] Criando nova seleção...');
    const selectedQuestions = await prisma.selectedQuestions.create({
      data: {
        questionIds,
        isActive: true
      }
    });

    console.log('[POST /api/questions/selected] Seleção criada com sucesso:', selectedQuestions);
    res.json(selectedQuestions);
  } catch (error) {
    console.error('[POST /api/questions/selected] Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para limpar questões selecionadas
router.delete('/selected', async (req, res) => {
  try {
    await prisma.selectedQuestions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    res.json({ message: 'Questões selecionadas removidas com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar questões selecionadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar questão por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    console.log('Questão encontrada:', {
      id: question.id,
      scrImage: question.scrImage
    });

    // Formata a questão para o formato esperado pelo frontend
    const formattedQuestion = {
      id: question.id,
      text: question.text,
      options: question.options as string[],
      correctAnswer: question.correctAnswer,
      category: question.category.name,
      categoryId: question.categoryId,
      difficulty: question.difficulty,
      scrImage: question.scrImage,
    };

    res.json(formattedQuestion);
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para selecionar questões
router.post('/select', async (req, res) => {
  try {
    const { totalQuestions, difficulty, excludeLastDays } = req.body;

    // Validação dos parâmetros
    if (!totalQuestions || !difficulty) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios não fornecidos' });
    }

    // Seleciona as questões
    const selectedQuestionIds = await questionSelector.selectQuestions({
      totalQuestions,
      difficulty,
      excludeLastDays: excludeLastDays || 90
    });

    // Desativa seleções anteriores
    await prisma.selectedQuestions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Cria nova seleção
    const selectedQuestions = await prisma.selectedQuestions.create({
      data: {
        questionIds: selectedQuestionIds,
        isActive: true
      }
    });

    res.json(selectedQuestions);
  } catch (error) {
    console.error('Erro ao selecionar questões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar histórico de questões
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Busca as questões com seus históricos
    const [questions, total] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT 
          q.*,
          c.name as category_name,
          c.description as category_description,
          qh."usedAt" as last_used_at
        FROM "Question" q
        LEFT JOIN "Category" c ON q."categoryId" = c.id
        LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
        WHERE qh.id IS NULL OR qh.id IN (
          SELECT id
          FROM "QuestionHistory"
          WHERE "questionId" = q.id
          ORDER BY "usedAt" DESC
          LIMIT 1
        )
        ORDER BY q."createdAt" DESC
        LIMIT ${Number(limit)}
        OFFSET ${skip}
      `,
      prisma.question.count()
    ]);

    // Formata os resultados
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      category: {
        name: q.category_name,
        description: q.category_description
      },
      lastUsedAt: q.last_used_at
    }));

    res.json({
      history: formattedQuestions,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar histórico específico de uma questão
router.get('/history/:questionId', async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId);

    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'ID da questão inválido' });
    }

    // Busca a questão e seu histórico completo
    const [question, history] = await Promise.all([
      prisma.question.findUnique({
        where: { id: questionId },
        include: { category: true }
      }),
      prisma.$queryRaw<any[]>`
        SELECT 
          qh.*,
          qs.score as quiz_score,
          qs."totalQuestions" as quiz_total_questions
        FROM "QuestionHistory" qh
        LEFT JOIN "QuizSession" qs ON qh."quizSessionId" = qs.id
        WHERE qh."questionId" = ${questionId}
        ORDER BY qh."usedAt" DESC
      `
    ]);

    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    res.json({
      ...question,
      history
    });
  } catch (error) {
    console.error('Erro ao buscar histórico da questão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar estatísticas de uso
router.get('/stats', async (req, res) => {
  try {
    // Busca estatísticas gerais
    const [basicStats, categoryStats, difficultyStats] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(DISTINCT q.id) as total_questions,
          COUNT(DISTINCT qh."questionId") as total_used
        FROM "Question" q
        LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
      `,
      prisma.$queryRaw<any[]>`
        SELECT 
          c.name,
          COUNT(DISTINCT q.id) as total_questions,
          COUNT(DISTINCT qh."questionId") as used_questions
        FROM "Category" c
        LEFT JOIN "Question" q ON q."categoryId" = c.id
        LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
        GROUP BY c.id, c.name
      `,
      prisma.$queryRaw<any[]>`
        SELECT 
          q.difficulty,
          COUNT(DISTINCT q.id) as total_questions,
          COUNT(DISTINCT qh."questionId") as used_questions
        FROM "Question" q
        LEFT JOIN "QuestionHistory" qh ON q.id = qh."questionId"
        GROUP BY q.difficulty
      `
    ]);

    res.json({
      totalQuestions: basicStats[0].total_questions,
      totalUsed: basicStats[0].total_used,
      categoryStats,
      difficultyStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 