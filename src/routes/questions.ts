import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ... outras rotas existentes ...

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

// Rota para buscar questões selecionadas ativas
router.get('/selected', async (req, res) => {
  try {
    const selectedQuestions = await prisma.selectedQuestions.findFirst({
      where: { isActive: true }
    });

    if (!selectedQuestions) {
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

    // Formata as questões para o frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: q.category.name,
      categoryId: q.categoryId,
      difficulty: q.difficulty.toLowerCase()
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Erro ao buscar questões selecionadas:', error);
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

export default router; 