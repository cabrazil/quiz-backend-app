import { PrismaClient } from '@prisma/client'
import { decode } from 'html-entities'

const prisma = new PrismaClient()

// Função para decodificar base64
function decodeBase64(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Erro ao decodificar base64:', error)
    return str
  }
}

// Função para decodificar caracteres especiais HTML
export function decodeHtmlEntities(text: string): string {
  if (!text) return text

  // Primeiro, decodificar as entidades HTML numéricas
  let decoded = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  
  // Depois, decodificar as entidades HTML hexadecimais
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Por fim, decodificar as entidades HTML nomeadas
  return decoded
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&middot;/g, '·')
    .replace(/&bull;/g, '•')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&euro;/g, '€')
    .replace(/&pound;/g, '£')
    .replace(/&yen;/g, '¥')
    .replace(/&cent;/g, '¢')
    .replace(/&deg;/g, '°')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&plusmn;/g, '±')
    .replace(/&sup2;/g, '²')
    .replace(/&sup3;/g, '³')
    .replace(/&acute;/g, '´')
    .replace(/&micro;/g, 'µ')
    .replace(/&para;/g, '¶')
    .replace(/&middot;/g, '·')
    .replace(/&cedil;/g, '¸')
    .replace(/&sup1;/g, '¹')
    .replace(/&ordm;/g, 'º')
    .replace(/&raquo;/g, '»')
    .replace(/&frac14;/g, '¼')
    .replace(/&frac12;/g, '½')
    .replace(/&frac34;/g, '¾')
    .replace(/&iquest;/g, '¿')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&ETH;/g, 'Ð')
    .replace(/&eth;/g, 'ð')
    .replace(/&THORN;/g, 'Þ')
    .replace(/&thorn;/g, 'þ')
    .replace(/&szlig;/g, 'ß')
    .replace(/&yuml;/g, 'ÿ')
    .replace(/&OElig;/g, 'Œ')
    .replace(/&oelig;/g, 'œ')
    .replace(/&Scaron;/g, 'Š')
    .replace(/&scaron;/g, 'š')
    .replace(/&Yuml;/g, 'Ÿ')
    .replace(/&fnof;/g, 'ƒ')
    .replace(/&circ;/g, 'ˆ')
    .replace(/&tilde;/g, '˜')
    .replace(/&Alpha;/g, 'Α')
    .replace(/&Beta;/g, 'Β')
    .replace(/&Gamma;/g, 'Γ')
    .replace(/&Delta;/g, 'Δ')
    .replace(/&Epsilon;/g, 'Ε')
    .replace(/&Zeta;/g, 'Ζ')
    .replace(/&Eta;/g, 'Η')
    .replace(/&Theta;/g, 'Θ')
    .replace(/&Iota;/g, 'Ι')
    .replace(/&Kappa;/g, 'Κ')
    .replace(/&Lambda;/g, 'Λ')
    .replace(/&Mu;/g, 'Μ')
    .replace(/&Nu;/g, 'Ν')
    .replace(/&Xi;/g, 'Ξ')
    .replace(/&Omicron;/g, 'Ο')
    .replace(/&Pi;/g, 'Π')
    .replace(/&Rho;/g, 'Ρ')
    .replace(/&Sigma;/g, 'Σ')
    .replace(/&Tau;/g, 'Τ')
    .replace(/&Upsilon;/g, 'Υ')
    .replace(/&Phi;/g, 'Φ')
    .replace(/&Chi;/g, 'Χ')
    .replace(/&Psi;/g, 'Ψ')
    .replace(/&Omega;/g, 'Ω')
    .replace(/&alpha;/g, 'α')
    .replace(/&beta;/g, 'β')
    .replace(/&gamma;/g, 'γ')
    .replace(/&delta;/g, 'δ')
    .replace(/&epsilon;/g, 'ε')
    .replace(/&zeta;/g, 'ζ')
    .replace(/&eta;/g, 'η')
    .replace(/&theta;/g, 'θ')
    .replace(/&iota;/g, 'ι')
    .replace(/&kappa;/g, 'κ')
    .replace(/&lambda;/g, 'λ')
    .replace(/&mu;/g, 'μ')
    .replace(/&nu;/g, 'ν')
    .replace(/&xi;/g, 'ξ')
    .replace(/&omicron;/g, 'ο')
    .replace(/&pi;/g, 'π')
    .replace(/&rho;/g, 'ρ')
    .replace(/&sigmaf;/g, 'ς')
    .replace(/&sigma;/g, 'σ')
    .replace(/&tau;/g, 'τ')
    .replace(/&upsilon;/g, 'υ')
    .replace(/&phi;/g, 'φ')
    .replace(/&chi;/g, 'χ')
    .replace(/&psi;/g, 'ψ')
    .replace(/&omega;/g, 'ω')
    .replace(/&thetasym;/g, 'ϑ')
    .replace(/&upsih;/g, 'ϒ')
    .replace(/&piv;/g, 'ϖ')
    .replace(/&ensp;/g, ' ')
    .replace(/&emsp;/g, ' ')
    .replace(/&thinsp;/g, ' ')
    .replace(/&zwnj;/g, '')
    .replace(/&zwj;/g, '')
    .replace(/&lrm;/g, '')
    .replace(/&rlm;/g, '')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&sbquo;/g, '‚')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&bdquo;/g, '„')
    .replace(/&dagger;/g, '†')
    .replace(/&Dagger;/g, '‡')
    .replace(/&bull;/g, '•')
    .replace(/&hellip;/g, '…')
    .replace(/&permil;/g, '‰')
    .replace(/&prime;/g, '′')
    .replace(/&Prime;/g, '″')
    .replace(/&lsaquo;/g, '‹')
    .replace(/&rsaquo;/g, '›')
    .replace(/&oline;/g, '‾')
    .replace(/&frasl;/g, '⁄')
    .replace(/&euro;/g, '€')
    .replace(/&image;/g, 'ℑ')
    .replace(/&weierp;/g, '℘')
    .replace(/&real;/g, 'ℜ')
    .replace(/&trade;/g, '™')
    .replace(/&alefsym;/g, 'ℵ')
    .replace(/&larr;/g, '←')
    .replace(/&uarr;/g, '↑')
    .replace(/&rarr;/g, '→')
    .replace(/&darr;/g, '↓')
    .replace(/&harr;/g, '↔')
    .replace(/&crarr;/g, '↵')
    .replace(/&lArr;/g, '⇐')
    .replace(/&uArr;/g, '⇑')
    .replace(/&rArr;/g, '⇒')
    .replace(/&dArr;/g, '⇓')
    .replace(/&hArr;/g, '⇔')
    .replace(/&forall;/g, '∀')
    .replace(/&part;/g, '∂')
    .replace(/&exist;/g, '∃')
    .replace(/&empty;/g, '∅')
    .replace(/&nabla;/g, '∇')
    .replace(/&isin;/g, '∈')
    .replace(/&notin;/g, '∉')
    .replace(/&ni;/g, '∋')
    .replace(/&prod;/g, '∏')
    .replace(/&sum;/g, '∑')
    .replace(/&minus;/g, '−')
    .replace(/&lowast;/g, '∗')
    .replace(/&radic;/g, '√')
    .replace(/&prop;/g, '∝')
    .replace(/&infin;/g, '∞')
    .replace(/&ang;/g, '∠')
    .replace(/&and;/g, '∧')
    .replace(/&or;/g, '∨')
    .replace(/&cap;/g, '∩')
    .replace(/&cup;/g, '∪')
    .replace(/&int;/g, '∫')
    .replace(/&there4;/g, '∴')
    .replace(/&sim;/g, '∼')
    .replace(/&cong;/g, '≅')
    .replace(/&asymp;/g, '≈')
    .replace(/&ne;/g, '≠')
    .replace(/&equiv;/g, '≡')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&sub;/g, '⊂')
    .replace(/&sup;/g, '⊃')
    .replace(/&nsub;/g, '⊄')
    .replace(/&sube;/g, '⊆')
    .replace(/&supe;/g, '⊇')
    .replace(/&oplus;/g, '⊕')
    .replace(/&otimes;/g, '⊗')
    .replace(/&perp;/g, '⊥')
    .replace(/&sdot;/g, '⋅')
    .replace(/&lceil;/g, '⌈')
    .replace(/&rceil;/g, '⌉')
    .replace(/&lfloor;/g, '⌊')
    .replace(/&rfloor;/g, '⌋')
    .replace(/&lang;/g, '〈')
    .replace(/&rang;/g, '〉')
    .replace(/&loz;/g, '◊')
    .replace(/&spades;/g, '♠')
    .replace(/&clubs;/g, '♣')
    .replace(/&hearts;/g, '♥')
    .replace(/&diams;/g, '♦')
}

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

// Mapeamento de níveis de dificuldade
const DIFFICULTY_TRANSLATIONS: Record<string, string> = {
  'easy': 'FÁCIL',
  'medium': 'MÉDIO',
  'hard': 'DIFÍCIL'
}

// Função para adicionar delay entre requisições
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function translateQuestions() {
  try {
    console.log('Iniciando tradução das perguntas...')
    
    // Buscar todas as perguntas
    const questions = await prisma.question.findMany()
    console.log(`Encontradas ${questions.length} perguntas para traduzir`)

    // Para cada pergunta, traduzir o conteúdo
    for (const question of questions) {
      try {
        console.log(`\nTraduzindo pergunta ID: ${question.id}`)
        
        // Decodificar campos em base64
        const decodedCategory = decodeBase64(question.category)
        const decodedDifficulty = decodeBase64(question.difficulty)
        const decodedText = decodeBase64(question.text)
        const decodedOptions = question.options.map(opt => decodeBase64(opt))
        const decodedCorrectAnswer = decodeBase64(question.correctAnswer)
        
        // Traduzir a pergunta
        const translatedText = await translateText(decodedText)
        
        // Traduzir as opções
        const translatedOptions = await Promise.all(
          decodedOptions.map(option => translateText(option))
        )
        
        // Traduzir a resposta correta
        const translatedCorrectAnswer = await translateText(decodedCorrectAnswer)
        
        // Traduzir categoria e dificuldade usando os mapeamentos
        const translatedCategory = CATEGORY_TRANSLATIONS[decodedCategory] || decodedCategory
        const translatedDifficulty = DIFFICULTY_TRANSLATIONS[decodedDifficulty.toLowerCase()] || decodedDifficulty
        
        // Atualizar a pergunta no banco de dados
        await prisma.question.update({
          where: { id: question.id },
          data: {
            text: translatedText,
            category: translatedCategory,
            difficulty: translatedDifficulty,
            options: translatedOptions,
            correctAnswer: translatedCorrectAnswer
          }
        })

        console.log(`Pergunta ${question.id} traduzida com sucesso`)
        console.log(`Categoria: ${translatedCategory}`)
        console.log(`Dificuldade: ${translatedDifficulty}`)
        
        // Adicionar delay entre as traduções para evitar sobrecarga
        await delay(1000)
      } catch (error) {
        console.error(`Erro ao traduzir pergunta ${question.id}:`, error)
        continue
      }
    }

    console.log('\nProcesso de tradução concluído!')
  } catch (error) {
    console.error('Erro durante o processo de tradução:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export async function translateText(text: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_TRANSLATE_API_KEY não configurada')
    }

    // Decodificar caracteres especiais HTML antes de traduzir
    const decodedText = decodeHtmlEntities(text)
    console.log('Texto original:', text)
    console.log('Texto decodificado:', decodedText)

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: decodedText,
        target: 'pt-BR',
        source: 'en'
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const translatedText = data.data.translations[0].translatedText
    console.log('Texto traduzido (bruto):', translatedText)
    
    // Decodificar novamente após a tradução para garantir que não haja entidades HTML
    const finalText = decodeHtmlEntities(translatedText)
    console.log('Texto final:', finalText)
    
    return finalText
  } catch (error) {
    console.error('Erro ao traduzir texto:', error)
    throw error
  }
} 