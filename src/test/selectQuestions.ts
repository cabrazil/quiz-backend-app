import { QuestionSelector } from '../services/questionSelector.js';

async function testQuestionSelection() {
  try {
    console.log('Testando seleção de questões...');

    const params = {
      totalQuestions: 10,
      difficulty: 'EASY' as const,
      excludeLastDays: 90
    };

    console.log('Parâmetros:', params);

    const questionSelector = new QuestionSelector();
    const selectedQuestions = await questionSelector.selectQuestions(params);

    console.log('Questões selecionadas:', selectedQuestions);
    console.log('Total de questões:', selectedQuestions.length);

  } catch (error) {
    console.error('Erro ao testar seleção de questões:', error);
  }
}

testQuestionSelection(); 