import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateQuestionSource() {
  try {
    console.log('Atualizando fonte das questões existentes...')
    
    const result = await prisma.question.updateMany({
      where: {
        source: null
      },
      data: {
        source: 'OTD'
      }
    })

    console.log(`Atualização concluída! ${result.count} questões foram marcadas como OTD.`)
  } catch (error) {
    console.error('Erro ao atualizar fonte das questões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
updateQuestionSource() 