import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/services/translateService'

const prisma = new PrismaClient()

// IDs específicos para processar
const QUESTION_IDS = [764, 765, 766, 795, 799, 871, 873, 919, 921, 959, 969, 972]

// Função para decodificar base64
function decodeBase64(str: string): string {
  try {
    // Remove espaços em branco e caracteres especiais
    const cleanStr = str.trim().replace(/\s+/g, '')
    
    // Tenta decodificar o base64
    const decoded = Buffer.from(cleanStr, 'base64').toString('utf-8')
    
    // Se o resultado contiver caracteres estranhos, retorna o texto original
    if (/[\uFFFD\uFFFE\uFFFF]/.test(decoded)) {
      console.log('Texto original não é base64 válido:', str)
      return str
    }
    
    return decoded
  } catch (error) {
    console.log('Erro ao decodificar base64:', str)
    return str
  }
}

async function translateSpecificQuestions() {
  try {
    console.log(`\nProcessando ${QUESTION_IDS.length} perguntas específicas`)

    for (const id of QUESTION_IDS) {
      const question = await prisma.question.findUnique({
        where: { id }
      })

      if (!question) {
        console.log(`\nPergunta ID ${id} não encontrada`)
        continue
      }

      console.log(`\nProcessando pergunta ID: ${id}`)
      console.log('Categoria:', question.category)
      console.log('Dificuldade:', question.difficulty)
      
      // Decodificar base64 antes de traduzir
      const decodedText = decodeBase64(question.text)
      const decodedCorrectAnswer = decodeBase64(question.correctAnswer)
      const decodedOptions = question.options.map(opt => decodeBase64(opt))

      console.log('\nTexto original:', question.text)
      console.log('Texto decodificado:', decodedText)
      console.log('\nResposta correta original:', question.correctAnswer)
      console.log('Resposta correta decodificada:', decodedCorrectAnswer)
      console.log('\nOpções originais:', question.options)
      console.log('Opções decodificadas:', decodedOptions)

      // Traduzir cada campo
      const translatedText = await translateText(decodedText)
      const translatedCorrectAnswer = await translateText(decodedCorrectAnswer)
      const translatedOptions = await Promise.all(decodedOptions.map(opt => translateText(opt)))

      // Atualizar a pergunta no banco de dados
      await prisma.question.update({
        where: { id },
        data: {
          text: translatedText,
          correctAnswer: translatedCorrectAnswer,
          options: translatedOptions
        }
      })

      console.log(`\nPergunta ${id} traduzida com sucesso`)
      console.log('----------------------------------------')

      // Aguardar 1 segundo entre as traduções para evitar sobrecarga na API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\nTodas as perguntas específicas foram processadas!')
  } catch (error) {
    console.error('Erro ao processar perguntas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

translateSpecificQuestions() 