import { PrismaClient } from '@prisma/client';
import { QuestionSelector } from '../services/questionSelector.js';

async function testSelectQuestions() {
  const prisma = new PrismaClient();
  const questionSelector = new QuestionSelector();

  try {
    console.log('Iniciando teste de seleção de questões...');

    // Parâmetros de teste
    const params = {
      totalQuestions: 5, // Começando com poucas questões
      difficulty: 'EASY' as const,
      excludeLastDays: 90
    };

    console.log('Parâmetros:', params);

    // Seleciona as questões
    const selectedQuestionIds = await questionSelector.selectQuestions(params);
    console.log('Questões selecionadas:', selectedQuestionIds);

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

    console.log('Seleção salva:', selectedQuestions);

    // Busca as questões completas
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: selectedQuestionIds
        }
      },
      include: {
        category: true
      }
    });

    console.log('Questões encontradas:', questions.map(q => ({
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      category: q.category.name
    })));

  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSelectQuestions(); 