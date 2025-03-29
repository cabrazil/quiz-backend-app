import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Limpar dados existentes
    await prisma.quizSession.deleteMany()
    await prisma.question.deleteMany()

    // Criar questões de exemplo
    const questions = await Promise.all([
      prisma.question.create({
        data: {
          text: 'Qual é a capital do Brasil?',
          category: 'Geografia',
          difficulty: 'EASY',
          correctAnswer: 'Brasília',
          options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
          explanation: 'Brasília é a capital federal do Brasil desde 1960.',
        },
      }),
      prisma.question.create({
        data: {
          text: 'Quem pintou a Mona Lisa?',
          category: 'Arte',
          difficulty: 'MEDIUM',
          correctAnswer: 'Leonardo da Vinci',
          options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
          explanation: 'A Mona Lisa foi pintada por Leonardo da Vinci entre 1503 e 1519.',
        },
      }),
      prisma.question.create({
        data: {
          text: 'Qual é o elemento químico com número atômico 1?',
          category: 'Ciências',
          difficulty: 'HARD',
          correctAnswer: 'Hidrogênio',
          options: ['Hélio', 'Hidrogênio', 'Lítio', 'Berílio'],
          explanation: 'O hidrogênio é o elemento mais simples e abundante do universo.',
        },
      }),
    ])

    // Criar sessões de quiz de exemplo
    await Promise.all([
      prisma.quizSession.create({
        data: {
          score: 8,
          totalQuestions: 10,
          completed: true,
        },
      }),
      prisma.quizSession.create({
        data: {
          score: 9,
          totalQuestions: 10,
          completed: true,
        },
      }),
      prisma.quizSession.create({
        data: {
          score: 7,
          totalQuestions: 10,
          completed: true,
        },
      }),
    ])

    console.log('Dados de exemplo criados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 