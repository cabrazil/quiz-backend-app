/**
 * Mapeamento semântico para melhorar a busca de imagens
 * Este arquivo contém mapeamentos de termos específicos para palavras-chave relacionadas
 */

// Mapeamento de termos específicos para palavras-chave relacionadas
export const semanticMapping: Record<string, string[]> = {
  // Filmes e obras literárias
  'jurassic park': ['dinosaur', 'dinossauro', 'filme', 'movie', 'steven spielberg', 'michael crichton', 'parque', 'park', 't-rex', 'velociraptor', 'jurassic', 'prehistoric', 'pré-histórico'],
  'star wars': ['space', 'espacial', 'guerra nas estrelas', 'luke skywalker', 'darth vader', 'jedi', 'sith', 'nave espacial', 'spaceship', 'galaxy', 'galáxia', 'bb-8', 'bb8', 'droid', 'robot', 'orange and white', 'laranja e branco', 'r2-d2', 'c-3po', 'stormtrooper', 'storm trooper', 'tie fighter', 'x-wing', 'death star', 'estrela da morte'],
  'lord of the rings': ['fantasy', 'fantasia', 'anel', 'ring', 'hobbit', 'tolkien', 'middle earth', 'terra média', 'gandalf', 'frodo', 'elf', 'elfo', 'dwarf', 'anão'],
  'harry potter': ['wizard', 'bruxo', 'magic', 'magia', 'hogwarts', 'varinha', 'wand', 'voldemort', 'dumbledore', 'witch', 'bruxa', 'spell', 'feitiço'],
  'game of thrones': ['fantasy', 'fantasia', 'medieval', 'dragão', 'dragon', 'winter', 'inverno', 'throne', 'trono', 'king', 'rei', 'queen', 'rainha'],
  'v de vingança': ['v for vendetta', 'masked', 'mascarado', 'guy fawkes', 'mask', 'máscara', 'revolution', 'revolução', 'anarchy', 'anarquia', 'london', 'londres', 'future', 'futuro', 'dystopian', 'distópico', 'november 5', '5 de novembro'],
  'matrix': ['matrix', 'neo', 'trinity', 'morpheus', 'agent smith', 'agent', 'agente', 'pill', 'pílula', 'red pill', 'blue pill', 'pílula vermelha', 'pílula azul', 'virtual reality', 'realidade virtual', 'cyberpunk', 'hacker', 'code', 'código', 'digital rain', 'chuva digital'],
  'avatar': ['avatar', 'pandora', 'na\'vi', 'jake sully', 'james cameron', 'blue', 'azul', 'alien', 'alienígena', 'tree', 'árvore', 'forest', 'floresta', 'flying', 'voando', 'banshee', 'ikran'],
  'inception': ['inception', 'dream', 'sonho', 'subconscious', 'subconsciente', 'cobb', 'dom', 'mal', 'arthur', 'ariadne', 'totem', 'totem', 'spinning top', 'pião', 'architecture', 'arquitetura', 'fold', 'dobrar', 'city', 'cidade', 'levitating', 'levitando'],
  'the dark knight': ['batman', 'joker', 'coringa', 'gotham', 'gotham city', 'cidade de gotham', 'harvey dent', 'two-face', 'duas caras', 'batmobile', 'batmóvel', 'batcave', 'batcaverna', 'chris nolan', 'christopher nolan', 'heath ledger', 'dark', 'escuro', 'knight', 'cavaleiro'],
  
  // Personagens de filmes
  'bb-8': ['bb8', 'bb-8', 'star wars', 'droid', 'robot', 'orange and white', 'laranja e branco', 'spherical', 'esférico', 'rolling', 'rolando', 'the force awakens', 'o despertar da força', 'rey', 'finn', 'poe', 'kylo ren', 'first order', 'primeira ordem', 'resistance', 'resistência'],
  'r2-d2': ['r2d2', 'r2-d2', 'star wars', 'droid', 'robot', 'blue and white', 'azul e branco', 'astromech', 'astromecânico', 'luke skywalker', 'c-3po', 'gold', 'dourado'],
  'c-3po': ['c3po', 'c-3po', 'star wars', 'droid', 'robot', 'gold', 'dourado', 'protocol', 'protocolo', 'human-cyborg relations', 'relações ciborgue-humano', 'r2-d2', 'threepio', 'threepio'],
  'darth vader': ['darth vader', 'anakin skywalker', 'star wars', 'sith', 'dark side', 'lado sombrio', 'force', 'força', 'lightsaber', 'sabre de luz', 'red', 'vermelho', 'black', 'preto', 'helmet', 'capacete', 'breathing', 'respiração', 'emperor', 'imperador', 'palpatine'],
  'joker': ['joker', 'coringa', 'heath ledger', 'batman', 'the dark knight', 'gotham', 'gotham city', 'cidade de gotham', 'green hair', 'cabelo verde', 'purple suit', 'terno roxo', 'makeup', 'maquiagem', 'scar', 'cicatriz', 'smile', 'sorriso', 'chaos', 'caos', 'anarchy', 'anarquia'],
  'neo': ['neo', 'thomas anderson', 'matrix', 'the one', 'o escolhido', 'keanu reeves', 'trinity', 'morpheus', 'agent smith', 'agent', 'agente', 'red pill', 'pílula vermelha', 'black', 'preto', 'coat', 'casaco', 'sunglasses', 'óculos de sol', 'kung fu', 'martial arts', 'artes marciais'],
  'gandalf': ['gandalf', 'the grey', 'o cinzento', 'the white', 'o branco', 'lord of the rings', 'wizard', 'mago', 'staff', 'cajado', 'pipe', 'cachimbo', 'horse', 'cavalo', 'shadowfax', 'shadowfax', 'istari', 'istari', 'middle earth', 'terra média', 'frodo', 'bilbo', 'hobbit'],
  'frodo': ['frodo', 'baggins', 'lord of the rings', 'hobbit', 'ring bearer', 'portador do anel', 'the one ring', 'o anel único', 'sam', 'samwise', 'gamgee', 'gandalf', 'middle earth', 'terra média', 'shire', 'condado', 'bilbo', 'bilbo baggins', 'sting', 'sting', 'sword', 'espada'],
  'harry potter character': ['harry potter', 'the boy who lived', 'o menino que sobreviveu', 'chosen one', 'o escolhido', 'wizard', 'bruxo', 'hogwarts', 'hogwarts school of witchcraft and wizardry', 'escola de magia e bruxaria de hogwarts', 'gryffindor', 'grifinória', 'scar', 'cicatriz', 'lightning bolt', 'raio', 'forehead', 'testa', 'glasses', 'óculos', 'round', 'redondo', 'wand', 'varinha', 'phoenix feather', 'pena de fênix', 'holly', 'azevinho', 'voldemort', 'he who must not be named', 'aquele que não deve ser nomeado'],
  'v character': ['v', 'v for vendetta', 'v de vingança', 'guy fawkes', 'mask', 'máscara', 'guy fawkes mask', 'máscara de guy fawkes', 'revolutionary', 'revolucionário', 'anarchist', 'anarquista', 'vigilante', 'justiceiro', 'vigilante', 'black', 'preto', 'cloak', 'capa', 'hat', 'chapéu', 'november 5', '5 de novembro', 'remember remember', 'lembre-se lembre-se', 'gunpowder', 'pólvora', 'treason', 'traição', 'plot', 'conspiração'],
  
  // Autores e escritores
  'michael crichton': ['author', 'autor', 'writer', 'escritor', 'jurassic park', 'book', 'livro', 'novel', 'romance'],
  'j.k. rowling': ['author', 'autor', 'writer', 'escritor', 'harry potter', 'book', 'livro', 'novel', 'romance'],
  'j.r.r. tolkien': ['author', 'autor', 'writer', 'escritor', 'lord of the rings', 'book', 'livro', 'novel', 'romance'],
  'george r.r. martin': ['author', 'autor', 'writer', 'escritor', 'game of thrones', 'book', 'livro', 'novel', 'romance'],
  'stephen king': ['author', 'autor', 'writer', 'escritor', 'horror', 'terror', 'book', 'livro', 'novel', 'romance'],
  'agatha christie': ['author', 'autor', 'writer', 'escritor', 'mystery', 'mistério', 'detective', 'detetive', 'book', 'livro', 'novel', 'romance'],
  'william shakespeare': ['author', 'autor', 'writer', 'escritor', 'playwright', 'dramaturgo', 'poet', 'poeta', 'theater', 'teatro', 'drama', 'comedy', 'comédia', 'tragedy', 'tragédia'],
  'charles dickens': ['author', 'autor', 'writer', 'escritor', 'victorian', 'vitoriano', 'book', 'livro', 'novel', 'romance', 'oliver twist', 'a christmas carol'],
  'jane austen': ['author', 'autor', 'writer', 'escritor', 'romance', 'pride and prejudice', 'orgulho e preconceito', 'book', 'livro', 'novel', 'romance'],
  'mark twain': ['author', 'autor', 'writer', 'escritor', 'tom sawyer', 'huckleberry finn', 'book', 'livro', 'novel', 'romance', 'adventure', 'aventura'],
  
  // Cientistas e inventores
  'albert einstein': ['scientist', 'cientista', 'physicist', 'físico', 'theory of relativity', 'teoria da relatividade', 'genius', 'gênio', 'physics', 'física', 'e=mc²'],
  'isaac newton': ['scientist', 'cientista', 'physicist', 'físico', 'gravity', 'gravidade', 'apple', 'maçã', 'physics', 'física', 'law of motion', 'leis do movimento'],
  'charles darwin': ['scientist', 'cientista', 'biologist', 'biólogo', 'evolution', 'evolução', 'natural selection', 'seleção natural', 'biology', 'biologia', 'species', 'espécies'],
  'marie curie': ['scientist', 'cientista', 'physicist', 'física', 'chemist', 'química', 'radioactivity', 'radioatividade', 'nobel prize', 'prêmio nobel', 'physics', 'física', 'chemistry', 'química'],
  'nikola tesla': ['scientist', 'cientista', 'inventor', 'inventor', 'electricity', 'eletricidade', 'ac current', 'corrente alternada', 'physics', 'física', 'engineering', 'engenharia'],
  
  // Artistas e músicos
  'leonardo da vinci': ['artist', 'artista', 'painter', 'pintor', 'inventor', 'inventor', 'mona lisa', 'last supper', 'última ceia', 'renaissance', 'renascimento', 'art', 'arte'],
  'pablo picasso': ['artist', 'artista', 'painter', 'pintor', 'cubism', 'cubismo', 'guernica', 'art', 'arte', 'modern art', 'arte moderna'],
  'vincent van gogh': ['artist', 'artista', 'painter', 'pintor', 'starry night', 'noite estrelada', 'sunflowers', 'girassóis', 'art', 'arte', 'post-impressionism', 'pós-impressionismo'],
  'mozart': ['composer', 'compositor', 'musician', 'músico', 'classical music', 'música clássica', 'symphony', 'sinfonia', 'opera', 'ópera', 'music', 'música'],
  'beethoven': ['composer', 'compositor', 'musician', 'músico', 'classical music', 'música clássica', 'symphony', 'sinfonia', 'music', 'música', 'deaf', 'surdo'],
  
  // Personalidades históricas
  'napoleon bonaparte': ['emperor', 'imperador', 'france', 'frança', 'military', 'militar', 'general', 'general', 'battle', 'batalha', 'waterloo', 'history', 'história'],
  'winston churchill': ['prime minister', 'primeiro-ministro', 'britain', 'grã-bretanha', 'world war', 'guerra mundial', 'politician', 'político', 'speech', 'discurso', 'history', 'história'],
  'martin luther king': ['civil rights', 'direitos civis', 'activist', 'ativista', 'speech', 'discurso', 'i have a dream', 'eu tenho um sonho', 'history', 'história', 'peace', 'paz'],
  'nelson mandela': ['president', 'presidente', 'south africa', 'áfrica do sul', 'activist', 'ativista', 'apartheid', 'history', 'história', 'peace', 'paz', 'freedom', 'liberdade'],
  'gandhi': ['leader', 'líder', 'india', 'índia', 'independence', 'independência', 'peace', 'paz', 'nonviolence', 'não-violência', 'history', 'história'],
  
  // Lugares e países
  'paris': ['city', 'cidade', 'france', 'frança', 'eiffel tower', 'torre eiffel', 'louvre', 'landmark', 'ponto turístico', 'architecture', 'arquitetura', 'travel', 'viagem'],
  'rome': ['city', 'cidade', 'italy', 'itália', 'colosseum', 'coliseu', 'vatican', 'vaticano', 'landmark', 'ponto turístico', 'architecture', 'arquitetura', 'travel', 'viagem'],
  'new york': ['city', 'cidade', 'usa', 'eua', 'statue of liberty', 'estátua da liberdade', 'times square', 'empire state building', 'landmark', 'ponto turístico', 'architecture', 'arquitetura', 'travel', 'viagem'],
  'tokyo': ['city', 'cidade', 'japan', 'japão', 'technology', 'tecnologia', 'temple', 'templo', 'landmark', 'ponto turístico', 'architecture', 'arquitetura', 'travel', 'viagem'],
  'rio de janeiro': ['city', 'cidade', 'brazil', 'brasil', 'christ the redeemer', 'cristo redentor', 'copacabana', 'sugar loaf', 'pão de açúcar', 'landmark', 'ponto turístico', 'architecture', 'arquitetura', 'travel', 'viagem'],
  
  // Conceitos e temas
  'democracy': ['government', 'governo', 'politics', 'política', 'freedom', 'liberdade', 'vote', 'voto', 'election', 'eleição', 'parliament', 'parlamento', 'congress', 'congresso'],
  'evolution': ['biology', 'biologia', 'science', 'ciência', 'darwin', 'species', 'espécies', 'natural selection', 'seleção natural', 'adaptation', 'adaptação', 'survival', 'sobrevivência'],
  'gravity': ['physics', 'física', 'science', 'ciência', 'newton', 'apple', 'maçã', 'force', 'força', 'weight', 'peso', 'mass', 'massa', 'planet', 'planeta'],
  'photosynthesis': ['biology', 'biologia', 'science', 'ciência', 'plant', 'planta', 'leaf', 'folha', 'chlorophyll', 'clorofila', 'sunlight', 'luz solar', 'oxygen', 'oxigênio', 'carbon dioxide', 'dióxido de carbono'],
  'climate change': ['environment', 'meio ambiente', 'science', 'ciência', 'global warming', 'aquecimento global', 'pollution', 'poluição', 'greenhouse effect', 'efeito estufa', 'carbon', 'carbono', 'emission', 'emissão'],
  
  // Elementos visuais específicos
  'robot': ['robot', 'robô', 'droid', 'android', 'mechanical', 'mecânico', 'machine', 'máquina', 'automation', 'automação', 'artificial intelligence', 'inteligência artificial', 'ai', 'ia', 'technology', 'tecnologia', 'future', 'futuro', 'science fiction', 'ficção científica', 'sci-fi', 'ci-fi'],
  'mask': ['mask', 'máscara', 'face mask', 'máscara facial', 'costume', 'fantasia', 'disguise', 'disfarce', 'halloween', 'halloween', 'carnival', 'carnaval', 'party', 'festa', 'celebration', 'celebração', 'guy fawkes', 'guy fawkes', 'v for vendetta', 'v de vingança'],
  'movie': ['movie', 'filme', 'cinema', 'cinema', 'film', 'filme', 'scene', 'cena', 'actor', 'ator', 'actress', 'atriz', 'director', 'diretor', 'director', 'direção', 'hollywood', 'hollywood', 'studio', 'estúdio', 'premiere', 'estreia', 'award', 'prêmio', 'oscar', 'oscar'],
  'character': ['character', 'personagem', 'protagonist', 'protagonista', 'hero', 'herói', 'villain', 'vilão', 'antagonist', 'antagonista', 'role', 'papel', 'actor', 'ator', 'actress', 'atriz', 'performance', 'performance', 'portrayal', 'interpretação', 'costume', 'fantasia', 'makeup', 'maquiagem'],
  'star wars franchise': ['star wars', 'guerra nas estrelas', 'space', 'espacial', 'science fiction', 'ficção científica', 'sci-fi', 'ci-fi', 'lucasfilm', 'lucasfilm', 'disney', 'disney', 'force', 'força', 'jedi', 'jedi', 'sith', 'sith', 'lightsaber', 'sabre de luz', 'spaceship', 'nave espacial', 'galaxy', 'galáxia', 'bb-8', 'bb8', 'droid', 'robot', 'orange and white', 'laranja e branco']
};

// Função para obter palavras-chave relacionadas a um termo
export function getRelatedKeywords(term: string): string[] {
  // Normaliza o termo para minúsculas
  const normalizedTerm = term.toLowerCase();
  
  // Procura por correspondências exatas
  if (semanticMapping[normalizedTerm]) {
    return semanticMapping[normalizedTerm];
  }
  
  // Procura por correspondências parciais
  for (const [key, keywords] of Object.entries(semanticMapping)) {
    if (normalizedTerm.includes(key) || key.includes(normalizedTerm)) {
      return keywords;
    }
  }
  
  // Se não encontrar correspondência, retorna um array vazio
  return [];
}

// Função para obter palavras-chave relacionadas a múltiplos termos
export function getRelatedKeywordsForTerms(terms: string[]): string[] {
  const allKeywords = new Set<string>();
  
  for (const term of terms) {
    const keywords = getRelatedKeywords(term);
    keywords.forEach(keyword => allKeywords.add(keyword));
  }
  
  return Array.from(allKeywords);
} 