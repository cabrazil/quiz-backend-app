import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { translateText, decodeHtmlEntities } from '../src/services/translateServiceFix'

const prisma = new PrismaClient()

// Lista de categorias disponíveis em português
const AVAILABLE_CATEGORIES = {
  '9': 'Conhecimentos Gerais',
  '10': 'Entretenimento: Livros',
  '11': 'Entretenimento: Cinema',
  '12': 'Entretenimento: Música',
  '13': 'Entretenimento: Musicais e Teatro',
  '14': 'Entretenimento: Televisão',
  '15': 'Entretenimento: Jogos Eletrônicos',
  '16': 'Entretenimento: Jogos de Tabuleiro',
  '17': 'Ciência e Natureza',
  '18': 'Ciência: Computadores',
  '19': 'Ciência: Matemática',
  '20': 'Mitologia',
  '21': 'Esportes',
  '22': 'Geografia',
  '23': 'História',
  '24': 'Política',
  '25': 'Arte',
  '26': 'Celebridades',
  '27': 'Animais',
  '28': 'Veículos',
  '29': 'Entretenimento: Quadrinhos',
  '30': 'Ciência: Gadgets'
}

// Mapeamento de dificuldades
const DIFFICULTY_MAP = {
  'easy': 'Fácil',
  'medium': 'Médio',
  'hard': 'Difícil'
}

// Função para buscar perguntas da API
async function fetchQuestions(categoryId: string) {
  try {
    const response = await axios.get(`https://opentdb.com/api.php?amount=50&category=${categoryId}&type=multiple`)
    return response.data.results
  } catch (error) {
    console.error(`Erro ao buscar questões para categoria ${categoryId}:`, error)
    return []
  }
}

// Função para processar uma questão
async function processQuestion(question: any, categoryName: string) {
  try {
    // Decodificar caracteres especiais HTML
    const cleanedQuestion = decodeHtmlEntities(question.question)
    const cleanedCorrectAnswer = decodeHtmlEntities(question.correct_answer)
    const cleanedOptions = question.incorrect_answers.map((answer: string) => decodeHtmlEntities(answer))
    
    // Traduzir a questão e as respostas
    const translatedQuestion = await translateText(cleanedQuestion)
    const translatedCorrectAnswer = await translateText(cleanedCorrectAnswer)
    const translatedOptions = await Promise.all(cleanedOptions.map(opt => translateText(opt)))
    
    // Adiciona a resposta correta às opções
    translatedOptions.push(translatedCorrectAnswer)
    
    // Embaralha as opções
    const shuffledOptions = translatedOptions.sort(() => Math.random() - 0.5)
    
    // Busca a categoria no banco de dados
    const category = await prisma.category.findFirst({
      where: { name: categoryName }
    })

    if (!category) {
      console.error(`Categoria "${categoryName}" não encontrada`)
      return
    }

    // Cria a questão no banco de dados
    await prisma.question.create({
      data: {
        text: translatedQuestion,
        categoryId: category.id,
        difficulty: DIFFICULTY_MAP[question.difficulty as keyof typeof DIFFICULTY_MAP] || question.difficulty,
        correctAnswer: translatedCorrectAnswer,
        options: shuffledOptions,
        explanation: null, // Pode ser preenchido posteriormente
        source: 'OTD' // Open Trivia DB
      }
    })

    console.log(`Questão traduzida e criada com sucesso para categoria ${category.name}`)
    
    // Aguarda 1 segundo entre cada questão para não sobrecarregar a API de tradução
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Erro ao processar questão:', error)
  }
}

// Função principal para carregar questões de uma categoria
async function loadCategoryQuestions(categoryId: string) {
  try {
    if (!AVAILABLE_CATEGORIES[categoryId as keyof typeof AVAILABLE_CATEGORIES]) {
      console.error('Categoria inválida!')
      return
    }

    const categoryName = AVAILABLE_CATEGORIES[categoryId as keyof typeof AVAILABLE_CATEGORIES]
    console.log(`Iniciando carregamento de questões para categoria ${categoryName}...`)
    
    const questions = await fetchQuestions(categoryId)
    console.log(`Encontradas ${questions.length} questões para a categoria ${categoryName}`)
    
    for (const question of questions) {
      await processQuestion(question, categoryName)
    }
    
    console.log(`Carregamento de questões para categoria ${categoryName} concluído`)
  } catch (error) {
    console.error(`Erro ao carregar questões para categoria ${categoryId}:`, error)
  }
}

// Função para listar categorias disponíveis
function listAvailableCategories() {
  console.log('\nCategorias disponíveis:')
  Object.entries(AVAILABLE_CATEGORIES).forEach(([id, name]) => {
    console.log(`${id}: ${name}`)
  })
}

// Função principal
async function main() {
  try {
    listAvailableCategories()
    
    const readline = (await import('readline')).createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        readline.question(query, resolve)
      })
    }
    
    const categoryId = await question('\nDigite o ID da categoria para carregar as questões (ou "sair" para encerrar): ')
    
    if (categoryId.toLowerCase() === 'sair') {
      readline.close()
      return
    }
    
    await loadCategoryQuestions(categoryId)
    readline.close()
  } catch (error) {
    console.error('Erro ao executar o script:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
main() 