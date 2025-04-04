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
async function processQuestion(question: any, categoryName: string): Promise<'created' | 'ignored'> {
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
      return 'ignored'
    }

    // Verifica se a questão já existe
    const existingQuestion = await prisma.question.findFirst({
      where: {
        text: translatedQuestion
      }
    })

    if (existingQuestion) {
      console.log(`Questão ignorada (já existe) para categoria ${category.name}`)
      return 'ignored'
    } else {
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
      console.log("--------------------------------")
      return 'created'
    }
    
    // Aguarda 1 segundo entre cada questão para não sobrecarregar a API de tradução
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Erro ao processar questão:', error)
    return 'ignored'
  }
}

// Função para carregar questões de uma categoria
async function loadCategoryQuestions(category: string) {
  console.log(`\nCarregando questões para categoria ${category}...`)
  
  const questions = await fetchQuestions(category)
  console.log(`Encontradas ${questions.length} questões na API`)

  let createdCount = 0
  let ignoredCount = 0

  for (const question of questions) {
    const result = await processQuestion(question, CATEGORY_MAP[category as keyof typeof CATEGORY_MAP])
    if (result === 'created') createdCount++
    if (result === 'ignored') ignoredCount++
  }

  console.log(`\nResumo do carregamento para categoria ${CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]}:`)
  console.log(`- Total de questões encontradas: ${questions.length}`)
  console.log(`- Questões novas carregadas: ${createdCount}`)
  console.log(`- Questões ignoradas (já existentes): ${ignoredCount}`)
}

// Função principal
async function main() {
  try {
    let totalCreated = 0
    let totalIgnored = 0
    let totalFound = 0

    // Carregar questões para cada categoria
    for (const category of Object.keys(CATEGORY_MAP)) {
      const questions = await fetchQuestions(category)
      totalFound += questions.length

      let createdCount = 0
      let ignoredCount = 0

      for (const question of questions) {
        const result = await processQuestion(question, CATEGORY_MAP[category as keyof typeof CATEGORY_MAP])
        if (result === 'created') createdCount++
        if (result === 'ignored') ignoredCount++
      }

      totalCreated += createdCount
      totalIgnored += ignoredCount
    }

    console.log('\n=== Resumo Geral do Carregamento ===')
    console.log(`- Total de questões encontradas: ${totalFound}`)
    console.log(`- Total de questões novas carregadas: ${totalCreated}`)
    console.log(`- Total de questões ignoradas (já existentes): ${totalIgnored}`)
    console.log('\nProcesso de carregamento concluído!')
  } catch (error) {
    console.error('Erro ao carregar questões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
main() 