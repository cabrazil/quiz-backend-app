import { PrismaClient } from '@prisma/client'
import { translateCategory } from '../src/services/triviaService'

const prisma = new PrismaClient()

async function fixCategories() {
  try {
    console.log('Iniciando correção das categorias...')
    
    // Buscar todas as perguntas
    const questions = await prisma.question.findMany()
    console.log(`Encontradas ${questions.length} perguntas`)

    // Para cada pergunta, corrigir a categoria
    for (const question of questions) {
      try {
        const fixedCategory = translateCategory(question.category)
        
        if (fixedCategory !== question.category) {
          console.log(`\nCorrigindo categoria da pergunta ${question.id}:`)
          console.log(`Antes: ${question.category}`)
          console.log(`Depois: ${fixedCategory}`)
          
          await prisma.question.update({
            where: { id: question.id },
            data: { category: fixedCategory }
          })
        }
      } catch (error) {
        console.error(`Erro ao corrigir categoria da pergunta ${question.id}:`, error)
        continue
      }
    }

    console.log('\nProcesso de correção concluído!')
  } catch (error) {
    console.error('Erro durante o processo:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixCategories()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 