import { PrismaClient } from '@prisma/client';

async function testQuiz() {
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando teste do quiz...');

    // 1. Verifica se existem questões selecionadas
    const selectedQuestions = await prisma.selectedQuestions.findFirst({
      where: { isActive: true }
    });

    if (!selectedQuestions) {
      console.log('Nenhuma questão selecionada encontrada. Executando teste de seleção primeiro...');
      return;
    }

    console.log('Questões selecionadas encontradas:', selectedQuestions);

    // 2. Inicia o quiz
    console.log('\nIniciando o quiz...');
    const quizSession = await prisma.quizSession.create({
      data: {
        totalQuestions: selectedQuestions.questionIds.length,
        questions: {
          create: selectedQuestions.questionIds.map(questionId => ({
            questionId
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

    console.log('Quiz iniciado:', {
      sessionId: quizSession.id,
      totalQuestions: quizSession.totalQuestions,
      questions: quizSession.questions.map(q => ({
        id: q.question.id,
        text: q.question.text,
        category: q.question.category.name
      }))
    });

    // 3. Finaliza o quiz
    console.log('\nFinalizando o quiz...');
    const score = Math.floor(Math.random() * quizSession.totalQuestions); // Simula uma pontuação aleatória

    const finishedSession = await prisma.quizSession.update({
      where: { id: quizSession.id },
      data: { 
        score,
        completed: true
      },
      include: {
        questions: true
      }
    });

    console.log('Quiz finalizado:', {
      sessionId: finishedSession.id,
      score: finishedSession.score,
      totalQuestions: finishedSession.totalQuestions
    });

    // 4. Registra o histórico
    console.log('\nRegistrando histórico...');
    await prisma.questionHistory.createMany({
      data: finishedSession.questions.map(q => ({
        questionId: q.questionId,
        quizSessionId: finishedSession.id,
        usedAt: new Date()
      }))
    });

    console.log('Histórico registrado com sucesso');

    // 5. Desativa as questões selecionadas
    console.log('\nDesativando questões selecionadas...');
    await prisma.selectedQuestions.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    console.log('Questões selecionadas desativadas com sucesso');

  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuiz(); 