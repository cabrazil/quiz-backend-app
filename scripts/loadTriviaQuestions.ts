import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { translateText, decodeHtmlEntities } from '../src/services/translateServiceFix'

const prisma = new PrismaClient()

// Mapeamento de categorias da API para nossas categorias
const CATEGORY_MAP = {
  'geography': 'Geografia',
  'history': 'História'
}

// Mapeamento de dificuldades
const DIFFICULTY_MAP = {
  'easy': 'Fácil',
  'medium': 'Médio',
  'hard': 'Difícil'
}

// Função para buscar perguntas da API
async function fetchQuestions(category: string) {
  try {
    const response = await axios.get(`https://the-trivia-api.com/v2/questions`, {
      params: {
        limit: 10,
        category
      }
    })
    return response.data
  } catch (error) {
    console.error(`Erro ao buscar questões para categoria ${category}:`, error)
    return []
  }
}

// Função para processar uma questão
async function processQuestion(question: any, categoryName: string) {
  try {
    // Decodificar caracteres especiais HTML
    const cleanedQuestion = decodeHtmlEntities(question.question.text)
    const cleanedCorrectAnswer = decodeHtmlEntities(question.correctAnswer)
    const cleanedOptions = question.incorrectAnswers.map((answer: string) => decodeHtmlEntities(answer))
    
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
        source: 'TTA' // The Trivia API
      }
    })

    console.log(`Questão traduzida e criada com sucesso para categoria ${category.name}`)
    
    // Aguarda 1 segundo entre cada questão para não sobrecarregar a API de tradução
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Erro ao processar questão:', error)
  }
}

// Função para carregar questões de uma categoria
async function loadCategoryQuestions(category: string) {
  console.log(`\nCarregando questões para categoria ${category}...`)
  
  const questions = await fetchQuestions(category)
  console.log(`Encontradas ${questions.length} questões na API`)

  for (const question of questions) {
    await processQuestion(question, CATEGORY_MAP[category as keyof typeof CATEGORY_MAP])
  }
}

// Função principal
async function main() {
  try {
    // Carregar questões para cada categoria
    for (const category of Object.keys(CATEGORY_MAP)) {
      await loadCategoryQuestions(category)
    }

    console.log('\nProcesso de carregamento concluído!')
  } catch (error) {
    console.error('Erro ao carregar questões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
main() 