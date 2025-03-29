import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Categorias prioritárias
const PRIORITY_CATEGORIES = [
  'Science & Nature',
  'Entertainment: Video Games',
  'Entertainment: Books',
  'Entertainment: Film',
  'Entertainment: Television',
  'Entertainment: Music',
  'Entertainment: Japanese Anime & Manga',
  'Entertainment: Cartoon & Animations',
  'Entertainment: Comics',
  'Science: Computers',
  'Science: Mathematics',
  'Science: Gadgets',
  'Science: General Knowledge',
  'Science: Biology',
  'Science: Chemistry',
  'Science: Physics',
  'Science: Astronomy',
  'Science: Geography',
  'Science: History',
  'Science: Politics',
  'Science: Sports',
  'Science: Technology',
  'Science: Vehicles',
  'Science: Inventions',
  'Science: Mythology',
  'Science: Art',
  'Science: Celebrities',
  'Science: Animals',
  'Science: Board Games',
  'Science: Card Games'
]

// Função para decodificar base64
function decodeBase64(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Erro ao decodificar base64:', str)
    return str
  }
}

async function fetchCategories() {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php')
    return response.data.trivia_categories
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }
}

async function fetchQuestions(categoryId: number) {
  try {
    const response = await axios.get(`https://opentdb.com/api.php?amount=15&category=${categoryId}&type=multiple`)
    return response.data.results
  } catch (error) {
    console.error(`Erro ao buscar perguntas da categoria ${categoryId}:`, error)
    return []
  }
}

async function reloadQuestions() {
  try {
    console.log('Iniciando recarregamento das perguntas...')

    // Limpar tabela de perguntas
    await prisma.question.deleteMany()
    console.log('Tabela de perguntas limpa')

    // Buscar categorias
    const categories = await fetchCategories()
    console.log(`Total de categorias encontradas: ${categories.length}`)

    // Filtrar categorias prioritárias
    const priorityCategories = categories.filter(cat => 
      PRIORITY_CATEGORIES.includes(cat.name)
    )
    console.log(`Categorias prioritárias encontradas: ${priorityCategories.length}`)

    // Processar cada categoria
    for (const category of priorityCategories) {
      console.log(`\nProcessando categoria: ${category.name}`)
      
      // Buscar perguntas da categoria
      const questions = await fetchQuestions(category.id)
      console.log(`Perguntas encontradas: ${questions.length}`)

      // Salvar perguntas no banco
      for (const question of questions) {
        await prisma.question.create({
          data: {
            text: question.question,
            correctAnswer: question.correct_answer,
            options: question.incorrect_answers,
            category: category.name,
            difficulty: question.difficulty
          }
        })
      }

      console.log(`Perguntas da categoria ${category.name} salvas com sucesso`)
      
      // Aguardar 2 segundos entre as categorias para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log('\nRecarregamento concluído com sucesso!')
  } catch (error) {
    console.error('Erro durante o recarregamento:', error)
  } finally {
    await prisma.$disconnect()
  }
}

reloadQuestions() 