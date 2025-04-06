/**
 * Extrai palavras-chave relevantes do texto da questão
 * @param text Texto da questão
 * @param category Nome da categoria da questão
 * @returns Array de palavras-chave
 */
export function extractKeywords(text: string, category?: string): string[] {
  // Limpa o texto e converte para minúsculas
  const cleanText = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');

  // Divide o texto em palavras
  const words = cleanText.split(' ');

  // Lista de palavras comuns em português para filtrar
  const stopWords = new Set([
    'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo',
    'as', 'até', 'com', 'como', 'da', 'das', 'de', 'delas', 'dele', 'deles',
    'depois', 'do', 'dos', 'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre',
    'essa', 'essas', 'esse', 'esses', 'esta', 'estas', 'este', 'estes',
    'eu', 'foi', 'foram', 'fosse', 'fossem', 'fui', 'fôramos', 'fôrdes',
    'há', 'isso', 'isto', 'já', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo',
    'meu', 'meus', 'minha', 'minhas', 'na', 'nas', 'nem', 'no', 'nos',
    'nossa', 'nossas', 'nosso', 'nossos', 'num', 'nuns', 'nunca', 'o',
    'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'qual',
    'quando', 'que', 'quem', 'se', 'seja', 'sejam', 'sem', 'ser', 'será',
    'serão', 'seu', 'seus', 'sua', 'suas', 'também', 'te', 'tem', 'tinha',
    'tive', 'tivemos', 'tiveram', 'tu', 'tua', 'tuas', 'tudo', 'um', 'uma',
    'você', 'vocês', 'vos', 'à', 'às', 'é', 'está', 'estão', 'estou',
    'estamos', 'estiver', 'estivermos', 'estiveram', 'estive', 'tivemos',
    'tinha', 'tínhamos', 'tiver', 'tivermos', 'tiveram', 'tive', 'tivemos',
    'ter', 'tendo', 'tido', 'tenha', 'tenhamos', 'tenham', 'terei', 'teremos',
    'terá', 'terão', 'teria', 'teríamos', 'teriam', 'tivesse', 'tivéssemos',
    'tivessem', 'tiver', 'tivermos', 'tiverem', 'tive', 'tivemos', 'tiveram',
    'tendo', 'tido', 'tenha', 'tenhamos', 'tenham', 'terei', 'teremos',
    'terá', 'terão', 'teria', 'teríamos', 'teriam', 'tivesse', 'tivéssemos',
    'tivessem', 'tiver', 'tivermos', 'tiverem'
  ]);

  // Filtra palavras comuns e vazias
  const keywords = words.filter(word => 
    word.length > 2 && !stopWords.has(word)
  );

  // Adiciona a categoria como palavra-chave se existir
  if (category) {
    const categoryWords = category.toLowerCase().split(' ');
    keywords.push(...categoryWords.filter(word => 
      word.length > 2 && !stopWords.has(word)
    ));
  }

  // Remove duplicatas e retorna
  return [...new Set(keywords)];
} 