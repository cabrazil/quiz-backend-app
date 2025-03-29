import { Question } from '@prisma/client'

interface TriviaQuestion {
  category: string
  type: string
  difficulty: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

interface TriviaResponse {
  response_code: number
  results: TriviaQuestion[]
}

const BASE_URL = 'https://opentdb.com/api.php'

// Mapeamento de categorias em inglês para português
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'Science & Nature': 'Ciência e Natureza',
  'Science: Computers': 'Ciência: Computadores',
  'Science: Mathematics': 'Ciência: Matemática',
  'Science: Gadgets': 'Ciência: Gadgets',
  'Entertainment: Books': 'Entretenimento: Livros',
  'Entertainment: Film': 'Entretenimento: Filmes',
  'Entertainment: Music': 'Entretenimento: Música',
  'Entertainment: Television': 'Entretenimento: Televisão',
  'Entertainment: Video Games': 'Entretenimento: Jogos',
  'Entertainment: Board Games': 'Entretenimento: Jogos de Tabuleiro',
  'Entertainment: Comics': 'Entretenimento: Quadrinhos',
  'Entertainment: Japanese Anime & Manga': 'Entretenimento: Anime e Mangá',
  'Entertainment: Cartoon & Animations': 'Entretenimento: Desenhos Animados',
  'Sports': 'Esportes',
  'Geography': 'Geografia',
  'History': 'História',
  'Politics': 'Política',
  'Art': 'Arte',
  'Celebrities': 'Celebridades',
  'Animals': 'Animais',
  'Vehicles': 'Veículos',
  'Comics': 'Quadrinhos',
  'General Knowledge': 'Conhecimentos Gerais'
}

// IDs específicos para categorias problemáticas
export const CATEGORY_IDS: Record<string, number> = {
  'Science & Nature': 17,
  'Science: Computers': 18,
  'Science: Mathematics': 19,
  'Science: Gadgets': 30,
  'Entertainment: Video Games': 15,
  'Entertainment: Film': 11,
  'Entertainment: Music': 12,
  'Entertainment: Japanese Anime & Manga': 29,
  'Entertainment: Cartoon & Animations': 32,
  'Sports': 21,
  'Geography': 22,
  'History': 23,
  'Art': 25,
  'General Knowledge': 9
}

// Função para adicionar delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Função para tentar buscar perguntas com retry
export async function fetchQuestionsWithRetry(
  amount: number,
  category?: number,
  difficulty?: 'easy' | 'medium' | 'hard',
  maxRetries: number = 3
): Promise<Question[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxRetries} para categoria ${category}`)
      const questions = await fetchQuestions(amount, category, difficulty)
      if (questions.length > 0) {
        return questions
      }
      console.log(`Tentativa ${attempt}: Nenhuma pergunta encontrada`)
      await delay(2000 * attempt) // Delay crescente entre tentativas
    } catch (error) {
      console.log(`Tentativa ${attempt} falhou:`, error)
      if (attempt === maxRetries) throw error
      await delay(2000 * attempt)
    }
  }
  return []
}

export async function fetchQuestions(
  amount: number = 10,
  category?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<Question[]> {
  try {
    const params = new URLSearchParams({
      amount: amount.toString(),
      ...(category && { category: category.toString() }),
      ...(difficulty && { difficulty }),
      type: 'multiple'
    })

    const response = await fetch(`${BASE_URL}?${params}`)
    const data: TriviaResponse = await response.json()

    if (data.response_code !== 0) {
      throw new Error('Erro ao buscar perguntas')
    }

    return data.results.map((q): Question => ({
      id: 0, // Será preenchido pelo banco de dados
      text: q.question,
      category: translateCategory(q.category),
      difficulty: translateDifficulty(q.difficulty),
      correctAnswer: q.correct_answer,
      options: [
        q.correct_answer,
        ...q.incorrect_answers
      ].sort(() => Math.random() - 0.5), // Embaralha as opções
      explanation: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    throw error
  }
}

function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8')
}

export function translateCategory(category: string): string {
  // Primeiro decodifica os caracteres especiais HTML
  const decodedCategory = category
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
  
  // Depois traduz usando o mapeamento
  return CATEGORY_TRANSLATIONS[decodedCategory] || decodedCategory
}

function translateDifficulty(difficulty: string): string {
  const translations: Record<string, string> = {
    'easy': 'FÁCIL',
    'medium': 'MÉDIO',
    'hard': 'DIFÍCIL'
  }
  return translations[difficulty] || difficulty.toUpperCase()
}

export async function fetchCategories() {
  try {
    const response = await fetch('https://opentdb.com/api_category.php')
    const data = await response.json()
    return data.trivia_categories
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    throw error
  }
} 