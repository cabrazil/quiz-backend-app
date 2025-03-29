import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/services/translateService'
import axios from 'axios'

const prisma = new PrismaClient()

// Lista de categorias disponíveis
const AVAILABLE_CATEGORIES = {
  '9': 'General Knowledge',
  '10': 'Entertainment: Books',
  '11': 'Entertainment: Film',
  '12': 'Entertainment: Music',
  '13': 'Entertainment: Musicals & Theatres',
  '14': 'Entertainment: Television',
  '15': 'Entertainment: Video Games',
  '16': 'Entertainment: Board Games',
  '17': 'Science & Nature',
  '18': 'Science: Computers',
  '19': 'Science: Mathematics',
  '20': 'Mythology',
  '21': 'Sports',
  '22': 'Geography',
  '23': 'History',
  '24': 'Politics',
  '25': 'Art',
  '26': 'Celebrities',
  '27': 'Animals',
  '28': 'Vehicles',
  '29': 'Entertainment: Comics',
  '30': 'Science: Gadgets'
}

// Função para buscar perguntas da API
async function fetchQuestions(categoryId: string) {
  try {
    const response = await axios.get(`https://opentdb.com/api.php?amount=50&category=${categoryId}&type=multiple`)
    return response.data.results
  } catch (error) {
    console.error('Erro ao buscar perguntas da API:', error)
    return []
  }
}

// Função para limpar caracteres especiais
function cleanSpecialCharacters(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&#47;/g, '/')
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

async function loadCategory(categoryId: string) {
  try {
    // Verificar se a categoria existe
    if (!AVAILABLE_CATEGORIES[categoryId]) {
      console.error('Categoria inválida!')
      console.log('\nCategorias disponíveis:')
      Object.entries(AVAILABLE_CATEGORIES).forEach(([id, name]) => {
        console.log(`${id}: ${name}`)
      })
      return
    }

    const categoryName = AVAILABLE_CATEGORIES[categoryId]
    console.log(`\nIniciando carga da categoria ${categoryName}`)

    // Buscar perguntas da API
    const questions = await fetchQuestions(categoryId)
    console.log(`Encontradas ${questions.length} perguntas na API`)

    // Processar cada pergunta
    for (const apiQuestion of questions) {
      // Limpar caracteres especiais
      const cleanedQuestion = cleanSpecialCharacters(apiQuestion.question)
      const cleanedCorrectAnswer = cleanSpecialCharacters(apiQuestion.correct_answer)
      const cleanedOptions = apiQuestion.incorrect_answers.map(opt => cleanSpecialCharacters(opt))

      // Traduzir cada campo
      const translatedQuestion = await translateText(cleanedQuestion)
      const translatedCorrectAnswer = await translateText(cleanedCorrectAnswer)
      const translatedOptions = await Promise.all(cleanedOptions.map(opt => translateText(opt)))

      // Salvar no banco de dados
      await prisma.question.create({
        data: {
          text: translatedQuestion,
          correctAnswer: translatedCorrectAnswer,
          options: translatedOptions,
          category: categoryName,
          difficulty: apiQuestion.difficulty
        }
      })

      // Aguardar 1 segundo entre as traduções
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\nTodas as perguntas da categoria ${categoryName} foram processadas!`)
  } catch (error) {
    console.error('Erro ao processar perguntas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Pegar a categoria do argumento da linha de comando
const categoryId = process.argv[2]

if (!categoryId) {
  console.error('Por favor, forneça o ID da categoria como argumento!')
  console.log('\nCategorias disponíveis:')
  Object.entries(AVAILABLE_CATEGORIES).forEach(([id, name]) => {
    console.log(`${id}: ${name}`)
  })
  process.exit(1)
}

loadCategory(categoryId) 