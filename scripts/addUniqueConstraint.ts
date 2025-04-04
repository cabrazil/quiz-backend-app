import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function addUniqueConstraint() {
  try {
    // Obtém o diretório atual usando ES modules
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    
    // Lê o arquivo SQL
    const sqlPath = join(__dirname, 'addUniqueConstraint.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Executa o SQL
    await prisma.$executeRawUnsafe(sql)

    console.log('Constraint unique adicionada com sucesso!')
  } catch (error) {
    console.error('Erro ao adicionar constraint:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executa a função
addUniqueConstraint() 