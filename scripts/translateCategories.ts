import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/services/translateServiceFix'

const prisma = new PrismaClient()

async function translateCategories() {
  try {
    console.log('Iniciando tradução das categorias...')
    
    const categories = await prisma.category.findMany()
    console.log(`Encontradas ${categories.length} categorias para traduzir`)

    for (const category of categories) {
      console.log(`\nProcessando categoria: ${category.name}`)
      
      // Traduzir nome
      const translatedName = await translateText(category.name)
      
      // Traduzir descrição se existir
      let translatedDescription: string | null = null
      if (category.description) {
        translatedDescription = await translateText(category.description)
      }

      // Atualizar a categoria no banco de dados
      await prisma.category.update({
        where: { id: category.id },
        data: {
          name: translatedName,
          description: translatedDescription
        }
      })

      console.log(`Categoria traduzida com sucesso: ${translatedName}`)
      
      // Aguardar 1 segundo entre as traduções para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\nTodas as categorias foram traduzidas com sucesso!')
  } catch (error) {
    console.error('Erro ao traduzir categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
translateCategories() 