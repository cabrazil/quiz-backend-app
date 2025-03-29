import { PrismaClient } from '@prisma/client'
import { translateText, decodeHtmlEntities } from '../src/services/translateService'

const prisma = new PrismaClient()

async function testTranslation() {
  try {
    console.log('Iniciando teste de tradução...')
    
    // Buscar uma única pergunta
    const question = await prisma.question.findFirst()
    if (!question) {
      console.log('Nenhuma pergunta encontrada no banco de dados')
      return
    }

    console.log('\nPergunta original:')
    console.log('-------------------')
    console.log(`ID: ${question.id}`)
    console.log(`Categoria: ${question.category}`)
    console.log(`Dificuldade: ${question.difficulty}`)
    console.log(`Pergunta: ${question.text}`)
    console.log(`Resposta correta: ${question.correctAnswer}`)
    console.log('Opções:')
    question.options.forEach((opt, index) => console.log(`${index + 1}. ${opt}`))

    console.log('\nPergunta decodificada:')
    console.log('-------------------')
    console.log(`Pergunta: ${decodeHtmlEntities(question.text)}`)
    console.log(`Resposta correta: ${decodeHtmlEntities(question.correctAnswer)}`)
    console.log('Opções:')
    question.options.forEach((opt, index) => console.log(`${index + 1}. ${decodeHtmlEntities(opt)}`))

    console.log('\nTraduzindo...')
    
    // Traduzir a pergunta
    const translatedText = await translateText(question.text)
    const translatedCorrectAnswer = await translateText(question.correctAnswer)
    const translatedOptions = await Promise.all(
      question.options.map(opt => translateText(opt))
    )

    console.log('\nPergunta traduzida:')
    console.log('-------------------')
    console.log(`Pergunta: ${translatedText}`)
    console.log(`Resposta correta: ${translatedCorrectAnswer}`)
    console.log('Opções:')
    translatedOptions.forEach((opt, index) => console.log(`${index + 1}. ${opt}`))

  } catch (error) {
    console.error('Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTranslation()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 