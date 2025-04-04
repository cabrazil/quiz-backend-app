import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDuplicateQuestions() {
  try {
    // Busca todas as questões
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        text: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        text: 'asc'
      }
    })

    // Agrupa questões por texto
    const questionGroups = questions.reduce((acc, question) => {
      if (!acc[question.text]) {
        acc[question.text] = []
      }
      acc[question.text].push(question)
      return acc
    }, {} as Record<string, typeof questions>)

    // Filtra apenas grupos com mais de uma questão
    const duplicates = Object.entries(questionGroups)
      .filter(([_, questions]) => questions.length > 1)
      .map(([text, questions]) => ({
        text,
        count: questions.length,
        questions
      }))

    // Exibe o relatório
    console.log('\n=== Relatório de Questões Duplicadas ===')
    console.log(`Total de questões no banco: ${questions.length}`)
    console.log(`Total de textos únicos: ${Object.keys(questionGroups).length}`)
    console.log(`Total de grupos com duplicatas: ${duplicates.length}`)
    
    if (duplicates.length > 0) {
      console.log('\nDetalhes das duplicatas:')
      duplicates.forEach(({ text, count, questions }) => {
        console.log(`\nTexto: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`)
        console.log(`Quantidade de duplicatas: ${count}`)
        console.log('IDs e categorias:')
        questions.forEach(q => {
          console.log(`- ID: ${q.id}, Categoria: ${q.category.name}, Criado em: ${q.createdAt.toLocaleDateString()}`)
        })
      })
    } else {
      console.log('\nNenhuma duplicata encontrada!')
    }

  } catch (error) {
    console.error('Erro ao verificar duplicatas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executa a verificação
checkDuplicateQuestions() 