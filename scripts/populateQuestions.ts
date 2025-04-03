import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Buscar todas as categorias
    const categories = await prisma.category.findMany()
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))

    // Exemplo de questões para cada categoria
    const questions = [
      {
        text: 'Qual foi o primeiro presidente do Brasil?',
        categoryId: categoryMap.get('história'),
        difficulty: 'FÁCIL',
        correctAnswer: 'Marechal Deodoro da Fonseca',
        options: [
          'Marechal Deodoro da Fonseca',
          'Prudente de Morais',
          'Floriano Peixoto',
          'Campos Sales',
        ],
        explanation: 'Marechal Deodoro da Fonseca foi o primeiro presidente do Brasil, após a Proclamação da República em 1889.',
      },
      {
        text: 'Qual é a capital do Brasil?',
        categoryId: categoryMap.get('geografia'),
        difficulty: 'FÁCIL',
        correctAnswer: 'Brasília',
        options: [
          'São Paulo',
          'Rio de Janeiro',
          'Brasília',
          'Salvador',
        ],
        explanation: 'Brasília é a capital do Brasil desde 1960, quando foi inaugurada pelo presidente Juscelino Kubitschek.',
      },
      {
        text: 'Qual é o maior planeta do Sistema Solar?',
        categoryId: categoryMap.get('ciências'),
        difficulty: 'FÁCIL',
        correctAnswer: 'Júpiter',
        options: [
          'Marte',
          'Júpiter',
          'Saturno',
          'Terra',
        ],
        explanation: 'Júpiter é o maior planeta do Sistema Solar, com um diâmetro de aproximadamente 142.984 km.',
      },
      {
        text: 'Quem venceu a Copa do Mundo de 2002?',
        categoryId: categoryMap.get('esportes'),
        difficulty: 'FÁCIL',
        correctAnswer: 'Brasil',
        options: [
          'Alemanha',
          'Brasil',
          'Itália',
          'França',
        ],
        explanation: 'O Brasil venceu a Copa do Mundo de 2002, realizada na Coreia do Sul e Japão, conquistando seu quinto título.',
      },
      {
        text: 'Qual é o nome do protagonista da série Breaking Bad?',
        categoryId: categoryMap.get('entretenimento'),
        difficulty: 'FÁCIL',
        correctAnswer: 'Walter White',
        options: [
          'Walter White',
          'Jesse Pinkman',
          'Saul Goodman',
          'Gus Fring',
        ],
        explanation: 'Walter White é o protagonista da série Breaking Bad, interpretado por Bryan Cranston.',
      },
    ]

    // Inserir as questões
    for (const question of questions) {
      await prisma.question.create({
        data: question,
      })
    }

    console.log('Questões populadas com sucesso!')
  } catch (error) {
    console.error('Erro ao popular questões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 