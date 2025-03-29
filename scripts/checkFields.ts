import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFields() {
  try {
    console.log('Verificando campos da tabela Question...')
    
    // Buscar todas as perguntas
    const questions = await prisma.question.findMany()
    console.log(`\nTotal de perguntas encontradas: ${questions.length}`)

    // Criar um mapa para contar categorias únicas
    const categoryCount = new Map<string, number>()
    const difficultyCount = new Map<string, number>()

    // Analisar cada pergunta
    questions.forEach(question => {
      // Contar categorias
      categoryCount.set(
        question.category,
        (categoryCount.get(question.category) || 0) + 1
      )

      // Contar dificuldades
      difficultyCount.set(
        question.difficulty,
        (difficultyCount.get(question.difficulty) || 0) + 1
      )
    })

    // Mostrar resultados
    console.log('\nCategorias encontradas:')
    categoryCount.forEach((count, category) => {
      console.log(`${category}: ${count} perguntas`)
    })

    console.log('\nNíveis de dificuldade encontrados:')
    difficultyCount.forEach((count, difficulty) => {
      console.log(`${difficulty}: ${count} perguntas`)
    })

    // Mostrar algumas perguntas como exemplo
    console.log('\nExemplos de perguntas:')
    questions.slice(0, 3).forEach(question => {
      console.log('\n-------------------')
      console.log(`ID: ${question.id}`)
      console.log(`Categoria: ${question.category}`)
      console.log(`Dificuldade: ${question.difficulty}`)
      console.log(`Pergunta: ${question.text}`)
    })

  } catch (error) {
    console.error('Erro ao verificar campos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFields()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 