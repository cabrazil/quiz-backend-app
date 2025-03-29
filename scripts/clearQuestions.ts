import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearQuestions() {
  try {
    console.log('Iniciando limpeza da tabela Question...')
    
    // Deletar todas as perguntas
    await prisma.question.deleteMany()
    
    console.log('Tabela Question limpa com sucesso!')
  } catch (error) {
    console.error('Erro ao limpar tabela Question:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearQuestions() 