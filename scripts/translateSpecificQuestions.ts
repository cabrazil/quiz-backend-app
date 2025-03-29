import { PrismaClient } from '@prisma/client'
import { translateText } from '../src/services/translateService'

const prisma = new PrismaClient()

// IDs específicos para processar
const QUESTION_IDS = [1260, 1285, 1323, 1325, 1334, 1340]

// Função para verificar se uma string está em base64
function isBase64(str: string): boolean {
  try {
    // Verifica se a string contém apenas caracteres válidos de base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
      return false
    }
    // Tenta decodificar e codificar novamente
    const decoded = Buffer.from(str, 'base64')
    const encoded = decoded.toString('base64')
    return encoded === str
  } catch (err) {
    return false
  }
}

// Função para decodificar base64
function decodeBase64(str: string): string {
  try {
    // Se não for base64, retorna o texto original
    if (!isBase64(str)) {
      return str
    }
    return Buffer.from(str, 'base64').toString('utf-8')
  } catch (error) {
    console.log('Erro ao decodificar base64:', str)
    return str
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
      
      // Decodificar base64 e limpar caracteres especiais
      const decodedText = decodeBase64(question.text)
      const decodedCorrectAnswer = decodeBase64(question.correctAnswer)
      const decodedOptions = question.options.map(opt => decodeBase64(opt))

      console.log('\nTexto original:', question.text)
      console.log('Texto decodificado:', decodedText)
      console.log('\nResposta correta original:', question.correctAnswer)
      console.log('Resposta correta decodificada:', decodedCorrectAnswer)
      console.log('\nOpções originais:', question.options)
      console.log('Opções decodificadas:', decodedOptions)

      // Limpar caracteres especiais
      const cleanedText = cleanSpecialCharacters(decodedText)
      const cleanedCorrectAnswer = cleanSpecialCharacters(decodedCorrectAnswer)
      const cleanedOptions = decodedOptions.map(opt => cleanSpecialCharacters(opt))

      console.log('\nTexto limpo:', cleanedText)
      console.log('Resposta correta limpa:', cleanedCorrectAnswer)
      console.log('Opções limpas:', cleanedOptions)

      // Traduzir cada campo
      const translatedText = await translateText(cleanedText)
      const translatedCorrectAnswer = await translateText(cleanedCorrectAnswer)
      const translatedOptions = await Promise.all(cleanedOptions.map(opt => translateText(opt)))

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