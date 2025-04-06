import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Rota para iniciar o quiz com as questões selecionadas
router.post('/start', async (req, res) => {
  try {
    // Busca as questões selecionadas ativas
    const selectedQuestions = await prisma.selectedQuestions.findFirst({
      where: { isActive: true }
    });

    if (!selectedQuestions) {
      return res.status(404).json({ error: 'Nenhuma questão selecionada encontrada' });
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

    // Cria uma nova sessão de quiz
    const quizSession = await prisma.quizSession.create({
      data: {
        totalQuestions: questions.length,
        questions: {
          create: questions.map(q => ({
            questionId: q.id
          }))
        }
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    // Atualiza o QuestionHistory com o quizSessionId
    await prisma.questionHistory.updateMany({
      where: {
        questionId: {
          in: questions.map(q => q.id)
        },
        quizSessionId: null
      },
      data: {
        quizSessionId: quizSession.id
      }
    });

    // Formata as questões para o frontend
    const formattedQuestions = quizSession.questions.map(q => ({
      id: q.question.id,
      text: q.question.text,
      options: q.question.options,
      correctAnswer: q.question.correctAnswer,
      category: q.question.category.name,
      categoryId: q.question.categoryId,
      difficulty: q.question.difficulty,
      scrImage: q.question.scrImage ? 
        (q.question.scrImage.startsWith('/questions/') ? 
          q.question.scrImage : 
          `/questions/${q.question.id}/image_1.jpg`) : 
        `/questions/${q.question.id}/image_1.jpg`
    }));

    res.json({
      sessionId: quizSession.id,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para finalizar o quiz
router.post('/:sessionId/finish', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { score } = req.body;

    // Atualiza a sessão com a pontuação
    const quizSession = await prisma.quizSession.update({
      where: { id: parseInt(sessionId) },
      data: { 
        score,
        completed: true
      },
      include: {
        questions: true
      }
    });

    // Registra o uso das questões
    await prisma.questionHistory.createMany({
      data: quizSession.questions.map(q => ({
        questionId: q.questionId,
        quizSessionId: quizSession.id,
        usedAt: new Date()
      }))
    });

    // Desativa as questões selecionadas
    await prisma.selectedQuestions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    res.json({
      message: 'Quiz finalizado com sucesso',
      score: quizSession.score,
      totalQuestions: quizSession.totalQuestions
    });
  } catch (error) {
    console.error('Erro ao finalizar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar histórico de sessões
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      prisma.quizSession.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      }),
      prisma.quizSession.count()
    ]);

    res.json({
      sessions,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de sessões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 