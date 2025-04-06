import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { QuestionSelector } from '../services/questionSelector.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();
const prisma = new PrismaClient();
const questionSelector = new QuestionSelector();

// Constante para o período de 90 dias em milissegundos
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

// Função para verificar se uma questão foi usada nos últimos 90 dias
async function wasQuestionRecentlyUsed(questionId: number): Promise<boolean> {
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS);
  
  const recentHistory = await prisma.questionHistory.findFirst({
    where: {
      questionId,
      usedAt: {
        gte: ninetyDaysAgo
      }
    }
  });

  return !!recentHistory;
}

// Função para registrar o uso de questões
async function registerQuestionsUsage(questionIds: number[]) {
  const now = new Date();
  
  // Cria registros de histórico para cada questão
  await prisma.questionHistory.createMany({
    data: questionIds.map(questionId => ({
      questionId,
      usedAt: now,
      createdAt: now
    }))
  });
}

// Rota para buscar questões com filtros
router.get('/', async (req, res) => {
  try {
    const { categoryId, difficulty, page = '1', limit = '10' } = req.query;
    console.log('[GET /api/questions] Parâmetros recebidos:', { categoryId, difficulty, page, limit });

    const where: any = {};
    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
      console.log('[GET /api/questions] Filtro de categoria:', where.categoryId);
    }
    if (difficulty) {
      where.difficulty = difficulty;
      console.log('[GET /api/questions] Filtro de dificuldade:', where.difficulty);
    }

    console.log('[GET /api/questions] Query completa:', where);

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Primeiro, vamos verificar se existem questões com esses filtros
    const count = await prisma.question.count({ where });
    console.log('[GET /api/questions] Total de questões encontradas:', count);

    if (count === 0) {
      // Se não encontrou questões, vamos verificar os valores existentes
      const categories = await prisma.category.findMany();
      const difficulties = await prisma.question.findMany({
        select: { difficulty: true },
        distinct: ['difficulty']
      });
      console.log('[GET /api/questions] Categorias disponíveis:', categories.map(c => ({ id: c.id, name: c.name })));
      console.log('[GET /api/questions] Dificuldades disponíveis:', difficulties.map(d => d.difficulty));
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          category: true
        }
      }),
      prisma.question.count({ where })
    ]);

    console.log('[GET /api/questions] Questões retornadas:', questions.length);

    const formattedQuestions = questions.map(q => ({
      ...q,
      category: q.category.name
    }));

    res.json({
      questions: formattedQuestions,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    });
  } catch (error) {
    console.error('[GET /api/questions] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar questões' });
  }
});

// Rota para buscar questões selecionadas
router.get('/selected', async (req, res) => {
  try {
    const selectedQuestions = await prisma.selectedQuestions.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!selectedQuestions) {
      return res.json({ questions: [] });
    }
    
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
    
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching selected questions:', error);
    res.status(500).json({ error: 'Erro ao buscar questões selecionadas' });
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

    // Verifica se alguma questão foi usada recentemente
    const recentlyUsedQuestions = await Promise.all(
      questionIds.map(async (id) => {
        const wasUsed = await wasQuestionRecentlyUsed(id);
        return wasUsed ? id : null;
      })
    );

    const usedIds = recentlyUsedQuestions.filter((id): id is number => id !== null);
    if (usedIds.length > 0) {
      console.log('[POST /api/questions/selected] Erro: questões já usadas recentemente:', usedIds);
      return res.status(400).json({ 
        error: 'Algumas questões já foram usadas recentemente',
        usedQuestionIds: usedIds
      });
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

    // Registra o uso das questões
    console.log('[POST /api/questions/selected] Registrando uso das questões...');
    await registerQuestionsUsage(questionIds);

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

// Rota para gerar explicação para uma questão
router.post('/:id/generate-explanation', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });

    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    // Gera uma explicação baseada na categoria, texto da questão e resposta correta
    let explanation = '';
    const categoryName = question.category.name.toLowerCase();
    
    // Extrai palavras-chave da questão para personalizar a explicação
    const questionWords = question.text.toLowerCase().split(' ').filter(word => word.length > 4);
    const uniqueWords = [...new Set(questionWords)].slice(0, 3); // Pega até 3 palavras únicas
    
    // Cria um contexto personalizado baseado nas palavras-chave
    const context = uniqueWords.length > 0 
      ? `No contexto de ${uniqueWords.join(', ')}` 
      : 'Neste contexto específico';
    
    switch (categoryName) {
      case 'história':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, este evento/figura histórica teve um impacto significativo. Este momento histórico foi fundamental para o desenvolvimento de ${categoryName === 'história do brasil' ? 'nossa sociedade' : 'diversas sociedades'} e suas consequências podem ser observadas até os dias de hoje. Um aspecto interessante é como este evento influenciou diretamente ${uniqueWords.length > 0 ? uniqueWords[0] : 'vários aspectos da sociedade'} e continua sendo relevante para compreendermos o presente.`;
        break;
      case 'geografia':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, esta característica geográfica é fundamental para entender a formação e desenvolvimento da região. Ela influencia diretamente aspectos como clima, vegetação, e até mesmo a distribuição populacional. Um fato interessante é que esta característica tem evoluído ao longo do tempo devido a fatores naturais e intervenções humanas, especialmente em relação a ${uniqueWords.length > 0 ? uniqueWords[0] : 'transformações ambientais'}.`;
        break;
      case 'ciência e natureza':
      case 'ciência: computadores':
      case 'ciência: matemática':
      case 'ciência: gadgets':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, este conceito científico é fundamental para entender ${categoryName.includes('computadores') ? 'o funcionamento dos sistemas digitais' : categoryName.includes('matemática') ? 'os princípios matemáticos' : 'os fenômenos naturais'}. Um aspecto interessante é que este conceito tem aplicações práticas em diversas áreas, desde ${categoryName.includes('computadores') ? 'desenvolvimento de software' : categoryName.includes('matemática') ? 'engenharia' : 'medicina'}, e continua evoluindo com novas descobertas relacionadas a ${uniqueWords.length > 0 ? uniqueWords[0] : 'tecnologias emergentes'}.`;
        break;
      case 'arte':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, esta obra/artista representa um momento importante na história da arte. O estilo e as técnicas utilizadas influenciaram gerações de artistas e continuam inspirando até hoje. Um fato curioso é que esta obra/artista foi ${categoryName.includes('brasileira') ? 'fundamental para o desenvolvimento da arte brasileira' : 'reconhecida internacionalmente por sua inovação e originalidade'}, especialmente em relação a ${uniqueWords.length > 0 ? uniqueWords[0] : 'técnicas artísticas'}.`;
        break;
      case 'esportes':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, este marco no esporte representa um momento histórico que transformou a modalidade. A conquista/evento não apenas estabeleceu novos recordes, mas também inspirou atletas em todo o mundo. Um aspecto interessante é como este momento influenciou o desenvolvimento do esporte e suas regras, especialmente em relação a ${uniqueWords.length > 0 ? uniqueWords[0] : 'técnicas e estratégias'}.`;
        break;
      case 'entretenimento: livros':
      case 'entretenimento: filmes':
      case 'entretenimento: música':
      case 'entretenimento: televisão':
      case 'entretenimento: jogos':
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, esta obra/artista é uma referência importante no ${categoryName.split(':')[1]?.trim() || 'entretenimento'}. Sua influência se estende além de sua área específica, impactando a cultura popular como um todo. Um fato interessante é como esta obra/artista continua relevante e influenciando novas gerações de criadores, especialmente em relação a ${uniqueWords.length > 0 ? uniqueWords[0] : 'tendências culturais'}.`;
        break;
      default:
        explanation = `${question.correctAnswer} é a resposta correta. ${context}, esta informação é particularmente relevante no contexto da categoria ${question.category.name}. Um aspecto interessante é como este conhecimento se conecta com outros conceitos relacionados e sua aplicação prática no dia a dia, especialmente em relação a ${uniqueWords.length > 0 ? uniqueWords[0] : 'conceitos fundamentais'}.`;
    }

    // Atualiza a questão com a explicação gerada
    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { explanation },
      include: { category: true }
    });

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Erro ao gerar explicação:', error);
    res.status(500).json({ error: 'Erro ao gerar explicação' });
  }
});

// Rota para atualizar uma questão
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    // Verifica se a questão existe
    const existingQuestion = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    // Atualiza a questão
    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        categoryId: questionData.categoryId,
        difficulty: questionData.difficulty,
        explanation: questionData.explanation,
        source: questionData.source,
        scrImage: questionData.scrImage
      },
      include: {
        category: true
      }
    });

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar uma nova questão
router.post('/', async (req, res) => {
  try {
    const questionData = req.body;
    console.log('[POST /api/questions] Dados recebidos:', questionData);

    // Validação dos campos obrigatórios
    if (!questionData.text || !questionData.options || !questionData.correctAnswer || !questionData.categoryId || !questionData.difficulty) {
      console.log('[POST /api/questions] Erro: campos obrigatórios faltando');
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    // Verifica se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id: questionData.categoryId }
    });

    if (!category) {
      console.log('[POST /api/questions] Erro: categoria não encontrada');
      return res.status(400).json({ error: 'Categoria não encontrada' });
    }

    // Cria a questão
    const question = await prisma.question.create({
      data: {
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        categoryId: questionData.categoryId,
        difficulty: questionData.difficulty,
        explanation: questionData.explanation,
        source: questionData.source,
        scrImage: questionData.scrImage
      },
      include: {
        category: true
      }
    });

    console.log('[POST /api/questions] Questão criada com sucesso:', question.id);
    res.status(201).json(question);
  } catch (error) {
    console.error('[POST /api/questions] Erro ao criar questão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar pastas para questões selecionadas
router.post('/create-folders', async (req, res) => {
  console.log('[POST /api/questions/create-folders] Iniciando processamento...');
  try {
    const { questionIds } = req.body;
    console.log('[POST /api/questions/create-folders] Recebendo questionIds:', questionIds);

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      console.log('[POST /api/questions/create-folders] Erro: questionIds inválido');
      return res.status(400).json({ error: 'IDs das questões são obrigatórios' });
    }

    // Executa o script para criar as pastas
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'create-question-folders.js');
      const questionIdsStr = questionIds.join(' ');
      const command = `node ${scriptPath} ${questionIdsStr}`;
      
      console.log('[POST /api/questions/create-folders] Executando comando:', command);
      
      const { stdout, stderr } = await execAsync(command);
      
      console.log('[POST /api/questions/create-folders] Saída do script:', stdout);
      
      if (stderr) {
        console.error('[POST /api/questions/create-folders] Erro do script:', stderr);
      }
      
      res.json({ 
        message: 'Script de criação de pastas executado com sucesso',
        output: stdout,
        error: stderr || undefined
      });
    } catch (scriptError) {
      console.error('[POST /api/questions/create-folders] Erro ao executar script:', scriptError);
      res.status(500).json({ 
        error: 'Erro ao executar script de criação de pastas',
        details: scriptError instanceof Error ? scriptError.message : String(scriptError)
      });
    }
  } catch (error) {
    console.error('[POST /api/questions/create-folders] Erro detalhado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar opções de imagem para uma questão
router.get('/:id/images', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'ID da questão inválido' });
    }
    
    // Verifica se a questão existe
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }
    
    // Caminho para o arquivo de opções de imagem
    const optionsPath = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'questions', questionId.toString(), 'options', 'image-options.json');
    
    // Verifica se o arquivo de opções existe
    if (!fs.existsSync(optionsPath)) {
      // Se o arquivo não existe, executa o script para buscar imagens
      try {
        console.log('Arquivo de opções não encontrado. Executando script de busca de imagens...');
        await execAsync('npm run find-images');
        
        // Verifica novamente se o arquivo foi criado
        if (!fs.existsSync(optionsPath)) {
          return res.status(404).json({ error: 'Não foi possível gerar opções de imagem para esta questão' });
        }
      } catch (scriptError) {
        console.error('Erro ao executar script de busca de imagens:', scriptError);
        return res.status(500).json({ error: 'Erro ao gerar opções de imagem' });
      }
    }
    
    // Lê o arquivo de opções
    const imageOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
    
    return res.json(imageOptions);
  } catch (error) {
    console.error('Erro ao buscar opções de imagem:', error);
    return res.status(500).json({ error: 'Erro ao buscar opções de imagem' });
  }
});

export default router; 