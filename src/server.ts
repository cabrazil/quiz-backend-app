import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Mapeamento de dificuldades em inglês para português
const DIFFICULTY_MAP: Record<string, string> = {
  'easy': 'Fácil',
  'medium': 'Médio',
  'hard': 'Difícil'
};

app.use(cors());
app.use(express.json());

// Rota para buscar questões com filtros
app.get('/api/questions', async (req, res) => {
  try {
    const { limit = 10, difficulty, categoryId } = req.query;
    
    const where: any = {};
    if (difficulty && typeof difficulty === 'string') {
      // Converte a dificuldade para o formato do banco de dados
      where.difficulty = DIFFICULTY_MAP[difficulty];
      console.log('Dificuldade convertida:', where.difficulty);
    }
    if (categoryId && typeof categoryId === 'string') {
      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) }
      });
      if (category) {
        where.categoryId = Number(categoryId);
      }
    }

    console.log('Filtros aplicados:', where);

    // Buscar todas as questões que correspondem aos filtros
    const totalQuestions = await prisma.question.count({
      where
    });

    if (totalQuestions === 0) {
      return res.json([]);
    }

    // Gerar um offset aleatório
    const randomOffset = Math.floor(Math.random() * Math.max(0, totalQuestions - Number(limit)));

    const questions = await prisma.question.findMany({
      where,
      take: Number(limit),
      skip: randomOffset,
      orderBy: {
        id: 'asc',
      },
      include: {
        category: true
      }
    });

    // Embaralhar as questões
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    // Formatar as questões para o frontend
    const formattedQuestions = shuffledQuestions.map(q => ({
      id: q.id.toString(),
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: q.category.name,
      categoryId: q.categoryId,
      difficulty: q.difficulty.toLowerCase()
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões' });
  }
});

// Rota para buscar categorias
app.get('/api/categories', async (req, res) => {
  try {
    // Buscar categorias que têm questões
    const categories = await prisma.category.findMany({
      where: {
        questions: {
          some: {} // Retorna apenas categorias que têm pelo menos uma questão
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Rota para buscar questões por categoria
app.get('/api/categories/:categoryId/questions', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10, difficulty } = req.query;

    console.log('Parâmetros recebidos:', { categoryId, limit, difficulty });

    const where: any = {
      categoryId: Number(categoryId)
    };

    if (difficulty && typeof difficulty === 'string') {
      where.difficulty = DIFFICULTY_MAP[difficulty];
      console.log('Dificuldade convertida:', where.difficulty);
    }

    console.log('Filtros aplicados:', where);

    const questions = await prisma.question.findMany({
      where,
      take: Number(limit),
      orderBy: {
        id: 'asc',
      },
      include: {
        category: true
      }
    });

    console.log(`Total de questões encontradas: ${questions.length}`);

    // Formatar as questões para o frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id.toString(),
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      category: q.category.name,
      categoryId: q.categoryId,
      difficulty: q.difficulty.toLowerCase()
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Erro ao buscar questões da categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar questões da categoria' });
  }
});

// Rota para buscar questões da The Trivia API
app.get('/api/trivia/questions', async (req, res) => {
  try {
    const { limit = 10, difficulty, category } = req.query;
    
    // Construir a URL da API com os parâmetros
    let url = 'https://the-trivia-api.com/v2/questions';
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit.toString());
    if (difficulty) params.append('difficulty', difficulty.toString());
    if (category) params.append('category', category.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Fazer a requisição para a API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao buscar questões da API externa');
    }

    const data = await response.json();

    // Formatar as questões para nosso formato
    const formattedQuestions = data.map((q: any) => ({
      id: q.id,
      text: q.question.text,
      category: q.category,
      difficulty: q.difficulty.toUpperCase(),
      correctAnswer: q.correctAnswer,
      options: [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5),
      explanation: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 