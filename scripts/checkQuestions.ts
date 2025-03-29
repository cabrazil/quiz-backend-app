import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestions() {
  try {
    // Buscar a categoria "Conhecimentos Gerais"
    const category = await prisma.category.findFirst({
      where: { name: 'Conhecimentos Gerais' }
    });

    if (!category) {
      console.log('Categoria "Conhecimentos Gerais" não encontrada');
      return;
    }

    console.log(`\nCategoria encontrada: ${category.name} (ID: ${category.id})`);

    // Buscar questões da categoria
    const questions = await prisma.question.findMany({
      where: {
        categoryId: category.id,
        difficulty: 'HARD'
      },
      include: {
        category: true
      }
    });

    console.log(`\nTotal de questões encontradas: ${questions.length}`);
    console.log('\nDetalhes das questões:');
    questions.forEach((q, index) => {
      console.log(`\nQuestão ${index + 1}:`);
      console.log(`ID: ${q.id}`);
      console.log(`Texto: ${q.text}`);
      console.log(`Dificuldade: ${q.difficulty}`);
      console.log(`Resposta correta: ${q.correctAnswer}`);
      console.log(`Opções: ${q.options.join(', ')}`);
    });

  } catch (error) {
    console.error('Erro ao verificar questões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestions(); 