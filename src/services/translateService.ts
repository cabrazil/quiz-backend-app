import axios from 'axios'

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

export async function translateText(text: string): Promise<string> {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: 'pt',
        source: 'en'
      }
    )

    return response.data.data.translations[0].translatedText
  } catch (error) {
    console.error('Erro ao traduzir texto:', error)
    return text // Retorna o texto original em caso de erro
  }
} 