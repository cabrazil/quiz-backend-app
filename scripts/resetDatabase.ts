import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar todas as tabelas
    await prisma.quizSession.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();

    // Criar categorias iniciais
    const categories = [
      {
        name: 'História',
        description: 'Questões sobre eventos históricos e personalidades',
      },
      {
        name: 'Geografia',
        description: 'Questões sobre países, capitais, relevo e clima',
      },
      {
        name: 'Ciências',
        description: 'Questões sobre física, química e biologia',
      },
      {
        name: 'Esportes',
        description: 'Questões sobre futebol, olimpíadas e outros esportes',
      },
      {
        name: 'Entretenimento',
        description: 'Questões sobre filmes, séries, música e cultura pop',
      },
    ];

    for (const category of categories) {
      await prisma.category.create({
        data: category,
      });
    }

    console.log('Banco de dados resetado e categorias criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 