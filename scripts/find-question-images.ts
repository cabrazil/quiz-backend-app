import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import { extractKeywords } from '../src/utils/textUtils.js';
import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { getRelatedKeywords, getRelatedKeywordsForTerms } from './semantic-mapping.js';

dotenv.config();

const prisma = new PrismaClient();
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

// Check if the API keys are configured
if (!UNSPLASH_ACCESS_KEY) {
  console.error('ERROR: Unsplash API key is not configured!');
  console.error('Please add the UNSPLASH_ACCESS_KEY variable to your .env file');
  console.error('Example: UNSPLASH_ACCESS_KEY=your_access_key_here');
  process.exit(1);
}

// Verificar se a chave da API Google Translate está configurada
if (!GOOGLE_TRANSLATE_API_KEY) {
  console.error('ERRO: A chave da API Google Translate não está configurada!');
  console.error('Por favor, adicione a variável GOOGLE_TRANSLATE_API_KEY no arquivo .env');
  console.error('Exemplo: GOOGLE_TRANSLATE_API_KEY=sua_access_key_aqui');
  process.exit(1);
}

// Verificar se as chaves das APIs de imagens estão configuradas
if (!PEXELS_API_KEY) {
  console.error('ERRO: A chave da API Pexels não está configurada!');
  console.error('Por favor, adicione a variável PEXELS_API_KEY no arquivo .env');
  console.error('Exemplo: PEXELS_API_KEY=sua_access_key_aqui');
  process.exit(1);
}

if (!PIXABAY_API_KEY) {
  console.error('ERRO: A chave da API Pixabay não está configurada!');
  console.error('Por favor, adicione a variável PIXABAY_API_KEY no arquivo .env');
  console.error('Exemplo: PIXABAY_API_KEY=sua_access_key_aqui');
  process.exit(1);
}

// Show the first characters of the keys for debugging (maintaining security)
console.log('Access Keys configured:');
console.log('Unsplash:', UNSPLASH_ACCESS_KEY.substring(0, 8) + '...');
console.log('Pexels:', PEXELS_API_KEY.substring(0, 8) + '...');
console.log('Pixabay:', PIXABAY_API_KEY.substring(0, 8) + '...');

// Function to translate text to English using the Google Translate API
async function translateToEnglish(text: string): Promise<string> {
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: 'en',
        source: 'pt'
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return the original text in case of error
  }
}

// Função para extrair o contexto principal da questão
function extractMainContext(text: string): string {
  // Preserva aspas e hífens que podem ser importantes para nomes próprios
  const cleanText = text.toLowerCase()
    .replace(/[.,\\/#!$%\\^&\\*;:{}=\\-_`~()]/g, ' ')
    .replace(/\\s{2,}/g, ' ')
    .replace(/[0-9]/g, '');

  // Divide o texto em palavras
  const words = cleanText.split(' ');

  // Lista reduzida de palavras comuns em inglês para filtrar
  const stopWords = new Set([
    'what', 'which', 'how', 'for', 'with', 'without', 'by', 'about', 'between', 'during',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must', 'need', 'used', 'such', 'like', 'as',
    'when', 'where', 'why', 'who', 'whom', 'whose', 'if', 'then', 'than', 'so',
    'because', 'therefore', 'however', 'more', 'most', 'some', 'any', 'all', 'both',
    'each', 'every', 'either', 'neither', 'other', 'another', 'much', 'many', 'few',
    'little', 'several', 'enough', 'too', 'very', 'quite', 'rather', 'almost', 'nearly',
    'just', 'only', 'even', 'still', 'also', 'again', 'ever', 'never', 'always', 'often',
    'sometimes', 'usually', 'rarely', 'seldom', 'once', 'twice', 'here', 'there', 'now',
    'then', 'today', 'tomorrow', 'yesterday', 'ago', 'before', 'after', 'since', 'until',
    'while', 'during', 'through', 'throughout', 'across', 'along', 'around', 'behind',
    'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'from', 'in', 'inside',
    'into', 'near', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'through',
    'to', 'toward', 'under', 'underneath', 'up', 'upon', 'within', 'without'
  ]);

  // Identifica entidades nomeadas (nomes próprios, títulos de filmes, etc.)
  const namedEntities = new Set<string>();
  
  // Procura por padrões comuns de entidades nomeadas
  const patterns = [
    /"([^"]+)"/g,  // Texto entre aspas
    /'([^']+)'/g,  // Texto entre aspas simples
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g  // Palavras com inicial maiúscula
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Remove as aspas se presentes
        const entity = match.replace(/["']/g, '').toLowerCase();
        if (entity.length > 2) {
          namedEntities.add(entity);
        }
      });
    }
  }
  
  // Filtra palavras comuns e vazias, mas preserva entidades nomeadas
  const filteredWords = words.filter(word => 
    (word.length > 2 && !stopWords.has(word)) || 
    namedEntities.has(word)
  );
  
  // Adiciona as entidades nomeadas identificadas
  const result = [...new Set([...filteredWords, ...Array.from(namedEntities)])];
  
  return result.join(' ');
}

// Função para obter palavras-chave específicas para cada categoria
function getCategoryKeywords(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'geography': ['landscape', 'map', 'country', 'city', 'mountain', 'river', 'ocean', 'continent', 'region', 'territory'],
    'history': ['historical', 'ancient', 'medieval', 'war', 'battle', 'empire', 'kingdom', 'civilization', 'monument', 'artifact'],
    'science': ['laboratory', 'experiment', 'research', 'scientist', 'microscope', 'atom', 'molecule', 'cell', 'planet', 'galaxy'],
    'technology': ['computer', 'device', 'gadget', 'software', 'hardware', 'internet', 'robot', 'chip', 'circuit', 'digital'],
    'sports': ['athlete', 'game', 'match', 'competition', 'team', 'player', 'field', 'court', 'stadium', 'championship'],
    'entertainment': ['movie', 'film', 'actor', 'actress', 'concert', 'music', 'band', 'singer', 'performance', 'stage'],
    'literature': ['book', 'author', 'novel', 'poetry', 'writer', 'story', 'character', 'plot', 'genre', 'classic'],
    'art': ['painting', 'sculpture', 'artist', 'museum', 'gallery', 'exhibition', 'masterpiece', 'canvas', 'brush', 'color'],
    'music': ['instrument', 'orchestra', 'concert', 'band', 'singer', 'song', 'melody', 'rhythm', 'concert', 'performance'],
    'food': ['dish', 'meal', 'cuisine', 'restaurant', 'chef', 'cooking', 'ingredient', 'recipe', 'gourmet', 'delicacy'],
    'animals': ['wildlife', 'creature', 'species', 'habitat', 'nature', 'animal', 'beast', 'mammal', 'bird', 'fish'],
    'plants': ['flower', 'tree', 'garden', 'forest', 'jungle', 'plant', 'vegetation', 'botanical', 'flora', 'green'],
    'weather': ['cloud', 'rain', 'storm', 'sunny', 'climate', 'temperature', 'forecast', 'atmosphere', 'meteorology', 'precipitation'],
    'space': ['planet', 'star', 'galaxy', 'universe', 'astronomy', 'cosmos', 'nebula', 'constellation', 'astronaut', 'rocket'],
    'mathematics': ['equation', 'formula', 'calculation', 'geometry', 'algebra', 'number', 'mathematical', 'problem', 'solution', 'theorem'],
    'language': ['word', 'sentence', 'grammar', 'vocabulary', 'linguistics', 'translation', 'language', 'speech', 'writing', 'communication'],
    'philosophy': ['thinker', 'philosopher', 'thought', 'idea', 'concept', 'theory', 'wisdom', 'knowledge', 'reasoning', 'logic'],
    'religion': ['temple', 'church', 'mosque', 'synagogue', 'faith', 'belief', 'ritual', 'ceremony', 'spiritual', 'divine'],
    'politics': ['government', 'election', 'politician', 'policy', 'law', 'parliament', 'congress', 'democracy', 'vote', 'campaign'],
    'economics': ['market', 'economy', 'business', 'finance', 'trade', 'stock', 'currency', 'bank', 'investment', 'commerce'],
    'health': ['medical', 'doctor', 'hospital', 'patient', 'treatment', 'medicine', 'healthcare', 'wellness', 'fitness', 'diet'],
    'education': ['school', 'university', 'student', 'teacher', 'classroom', 'learning', 'education', 'academic', 'study', 'knowledge'],
    'transportation': ['vehicle', 'car', 'train', 'airplane', 'ship', 'transport', 'travel', 'journey', 'route', 'commute'],
    'architecture': ['building', 'structure', 'design', 'construction', 'architectural', 'house', 'tower', 'bridge', 'monument', 'facade'],
    'fashion': ['clothing', 'style', 'design', 'fashion', 'trend', 'outfit', 'accessory', 'model', 'runway', 'textile'],
    'video games': ['game', 'console', 'player', 'character', 'level', 'quest', 'adventure', 'arcade', 'gaming', 'controller'],
    'movies': ['film', 'cinema', 'movie', 'actor', 'actress', 'director', 'scene', 'plot', 'character', 'cinematography'],
    'television': ['tv', 'show', 'series', 'program', 'broadcast', 'channel', 'episode', 'screen', 'television', 'viewer'],
    'social media': ['network', 'platform', 'social', 'media', 'connection', 'communication', 'online', 'digital', 'internet', 'web'],
    'environment': ['nature', 'environment', 'ecosystem', 'conservation', 'sustainability', 'green', 'climate', 'planet', 'earth', 'wildlife'],
    'crime': ['police', 'detective', 'investigation', 'crime', 'law', 'justice', 'criminal', 'evidence', 'suspense', 'mystery'],
    'law': ['court', 'judge', 'lawyer', 'legal', 'justice', 'law', 'legislation', 'rights', 'constitution', 'jurisdiction'],
    'psychology': ['mind', 'brain', 'psychology', 'behavior', 'mental', 'cognitive', 'therapy', 'psychologist', 'emotion', 'thought'],
    'sociology': ['society', 'culture', 'social', 'group', 'community', 'population', 'demographics', 'sociology', 'interaction', 'relationship'],
    'anthropology': ['culture', 'society', 'human', 'anthropology', 'civilization', 'tribe', 'ethnic', 'tradition', 'ritual', 'heritage'],
    'archaeology': ['excavation', 'artifact', 'ruin', 'ancient', 'archaeology', 'discovery', 'site', 'fossil', 'remains', 'historical'],
    'chemistry': ['laboratory', 'chemical', 'reaction', 'molecule', 'atom', 'compound', 'element', 'chemistry', 'experiment', 'solution'],
    'physics': ['physics', 'force', 'energy', 'matter', 'particle', 'wave', 'quantum', 'relativity', 'gravity', 'motion'],
    'biology': ['cell', 'organism', 'biology', 'life', 'species', 'evolution', 'genetics', 'microscope', 'tissue', 'dna'],
    'geology': ['rock', 'mineral', 'earth', 'geology', 'formation', 'fossil', 'volcano', 'earthquake', 'plate', 'tectonic'],
    'astronomy': ['star', 'planet', 'galaxy', 'astronomy', 'universe', 'telescope', 'constellation', 'nebula', 'cosmos', 'astronomical'],
    'meteorology': ['weather', 'climate', 'meteorology', 'forecast', 'atmosphere', 'cloud', 'rain', 'storm', 'temperature', 'precipitation'],
    'oceanography': ['ocean', 'sea', 'marine', 'oceanography', 'water', 'wave', 'current', 'tide', 'coast', 'shore'],
    'botany': ['plant', 'flower', 'tree', 'botany', 'vegetation', 'leaf', 'seed', 'root', 'garden', 'forest'],
    'zoology': ['animal', 'species', 'zoology', 'wildlife', 'creature', 'mammal', 'bird', 'fish', 'reptile', 'amphibian'],
    'microbiology': ['microorganism', 'bacterium', 'virus', 'microbiology', 'microscope', 'cell', 'infection', 'pathogen', 'microbe', 'culture'],
    'genetics': ['dna', 'gene', 'chromosome', 'genetics', 'heredity', 'mutation', 'genome', 'inheritance', 'trait', 'evolution'],
    'ecology': ['ecosystem', 'environment', 'ecology', 'habitat', 'species', 'biodiversity', 'population', 'community', 'interaction', 'balance'],
    'paleontology': ['fossil', 'dinosaur', 'extinct', 'paleontology', 'prehistoric', 'remains', 'discovery', 'dig', 'excavation', 'ancient'],
    'neurology': ['brain', 'nerve', 'neurology', 'neuron', 'synapse', 'cognitive', 'mental', 'nervous', 'system', 'function'],
    'immunology': ['immune', 'antibody', 'infection', 'immunology', 'disease', 'virus', 'bacterium', 'pathogen', 'response', 'defense'],
    'endocrinology': ['hormone', 'endocrine', 'gland', 'endocrinology', 'metabolism', 'regulation', 'secretion', 'thyroid', 'pituitary', 'adrenal'],
    'cardiology': ['heart', 'cardiac', 'cardiovascular', 'cardiology', 'blood', 'vessel', 'circulation', 'pulse', 'rhythm', 'beat'],
    'dermatology': ['skin', 'dermatology', 'rash', 'lesion', 'disease', 'condition', 'treatment', 'dermatologist', 'allergy', 'infection'],
    'gastroenterology': ['digestive', 'stomach', 'intestine', 'gastroenterology', 'gut', 'bowel', 'liver', 'pancreas', 'esophagus', 'colon'],
    'hematology': ['blood', 'cell', 'hematology', 'plasma', 'platelet', 'hemoglobin', 'anemia', 'leukemia', 'lymphoma', 'clot'],
    'oncology': ['cancer', 'tumor', 'oncology', 'malignant', 'benign', 'chemotherapy', 'radiation', 'therapy', 'diagnosis', 'treatment'],
    'ophthalmology': ['eye', 'vision', 'ophthalmology', 'retina', 'cornea', 'lens', 'optic', 'sight', 'glaucoma', 'cataract'],
    'otolaryngology': ['ear', 'nose', 'throat', 'otolaryngology', 'hearing', 'voice', 'sinus', 'tinnitus', 'balance', 'smell'],
    'pediatrics': ['child', 'pediatric', 'infant', 'baby', 'pediatrics', 'growth', 'development', 'vaccination', 'pediatrician', 'adolescent'],
    'psychiatry': ['mental', 'psychiatry', 'psychiatric', 'disorder', 'therapy', 'treatment', 'psychiatrist', 'diagnosis', 'medication', 'counseling'],
    'surgery': ['surgery', 'operation', 'procedure', 'surgeon', 'incision', 'anesthesia', 'recovery', 'hospital', 'medical', 'treatment'],
    'urology': ['kidney', 'bladder', 'urology', 'urinary', 'prostate', 'urologist', 'nephrology', 'renal', 'urine', 'infection'],
    'gynecology': ['woman', 'gynecology', 'reproductive', 'pregnancy', 'gynecologist', 'obstetrics', 'fertility', 'menstruation', 'hormone', 'pelvic'],
    'orthopedics': ['bone', 'joint', 'orthopedics', 'fracture', 'surgery', 'rehabilitation', 'orthopedic', 'spine', 'muscle', 'tendon'],
    'dentistry': ['tooth', 'dental', 'dentistry', 'dentist', 'oral', 'hygiene', 'cavity', 'gum', 'orthodontics', 'prosthodontics'],
    'pharmacy': ['medicine', 'drug', 'pharmacy', 'prescription', 'pharmacist', 'medication', 'pill', 'tablet', 'capsule', 'syrup'],
    'nursing': ['nurse', 'nursing', 'care', 'patient', 'hospital', 'medical', 'healthcare', 'treatment', 'recovery', 'support'],
    'nutrition': ['food', 'diet', 'nutrition', 'nutrient', 'vitamin', 'mineral', 'healthy', 'eating', 'meal', 'supplement'],
    'physiotherapy': ['therapy', 'physiotherapy', 'rehabilitation', 'exercise', 'movement', 'physiotherapist', 'treatment', 'recovery', 'mobility', 'strength'],
    'radiology': ['imaging', 'x-ray', 'radiology', 'scan', 'diagnostic', 'radiation', 'mri', 'ct', 'ultrasound', 'radiologist'],
    'veterinary': ['animal', 'veterinary', 'veterinarian', 'pet', 'clinic', 'treatment', 'health', 'care', 'medicine', 'surgery'],
    'forensics': ['crime', 'forensics', 'evidence', 'investigation', 'analysis', 'laboratory', 'detective', 'police', 'examination', 'identification'],
    'toxicology': ['poison', 'toxic', 'toxicity', 'chemical', 'exposure', 'toxicology', 'hazard', 'risk', 'safety', 'protection'],
    'epidemiology': ['disease', 'epidemiology', 'outbreak', 'infection', 'transmission', 'prevention', 'control', 'public', 'health', 'population'],
    'parasitology': ['parasite', 'host', 'infection', 'parasitology', 'disease', 'transmission', 'lifecycle', 'treatment', 'prevention', 'diagnosis'],
    'virology': ['virus', 'infection', 'virology', 'disease', 'transmission', 'replication', 'host', 'pathogen', 'vaccine', 'treatment'],
    'bacteriology': ['bacterium', 'bacteria', 'infection', 'bacteriology', 'microorganism', 'pathogen', 'culture', 'identification', 'antibiotic', 'resistance'],
    'mycology': ['fungus', 'mold', 'yeast', 'mycology', 'infection', 'disease', 'spore', 'hyphae', 'identification', 'treatment'],
    'entomology': ['insect', 'bug', 'entomology', 'arthropod', 'species', 'identification', 'classification', 'behavior', 'habitat', 'lifecycle'],
    'ichthyology': ['fish', 'ichthyology', 'aquatic', 'species', 'identification', 'classification', 'habitat', 'behavior', 'reproduction', 'evolution'],
    'ornithology': ['bird', 'ornithology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'migration', 'reproduction', 'evolution'],
    'herpetology': ['reptile', 'amphibian', 'herpetology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'reproduction', 'evolution'],
    'mammalogy': ['mammal', 'species', 'mammalogy', 'identification', 'classification', 'habitat', 'behavior', 'reproduction', 'evolution', 'diversity'],
    'primatology': ['primate', 'monkey', 'ape', 'primatology', 'species', 'behavior', 'social', 'intelligence', 'evolution', 'habitat'],
    'cetology': ['whale', 'dolphin', 'cetacean', 'cetology', 'marine', 'mammal', 'species', 'behavior', 'communication', 'habitat'],
    'malacology': ['mollusk', 'shell', 'malacology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'reproduction', 'evolution'],
    'arachnology': ['spider', 'scorpion', 'arachnid', 'arachnology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'venom'],
    'lepidopterology': ['butterfly', 'moth', 'lepidoptera', 'lepidopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'metamorphosis'],
    'coleopterology': ['beetle', 'coleoptera', 'coleopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'reproduction', 'evolution'],
    'dipterology': ['fly', 'mosquito', 'diptera', 'dipterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'disease'],
    'hymenopterology': ['bee', 'wasp', 'ant', 'hymenoptera', 'hymenopterology', 'species', 'identification', 'classification', 'habitat', 'social'],
    'orthopterology': ['grasshopper', 'cricket', 'orthoptera', 'orthopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'sound'],
    'hemipterology': ['bug', 'hemiptera', 'hemipterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'feeding', 'plant'],
    'neuropterology': ['lacewing', 'antlion', 'neuroptera', 'neuropterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'predator'],
    'trichopterology': ['caddisfly', 'trichoptera', 'trichopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'aquatic', 'larva'],
    'plecopterology': ['stonefly', 'plecoptera', 'plecopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'aquatic', 'larva'],
    'ephemeropterology': ['mayfly', 'ephemeroptera', 'ephemeropterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'aquatic', 'larva'],
    'odonatology': ['dragonfly', 'damselfly', 'odonata', 'odonatology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'predator'],
    'isopterology': ['termite', 'isoptera', 'isopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'social', 'colony'],
    'blattopterology': ['cockroach', 'blattodea', 'blattopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'adaptation', 'survival'],
    'mantopterology': ['mantis', 'mantodea', 'mantopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'predator', 'praying'],
    'phasmatopterology': ['stick', 'leaf', 'phasmatodea', 'phasmatopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'camouflage'],
    'dermapterology': ['earwig', 'dermaptera', 'dermapterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'pincer', 'nocturnal'],
    'embiopterology': ['webspinner', 'embioptera', 'embiopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'silk', 'tunnel'],
    'grylloblattology': ['ice', 'crawler', 'grylloblattodea', 'grylloblattology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'cold', 'adapted'],
    'mecopterology': ['scorpionfly', 'mecoptera', 'mecopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'predator', 'scavenger'],
    'siphonapterology': ['flea', 'siphonaptera', 'siphonapterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'parasite', 'jumping'],
    'strepsipterology': ['twisted', 'wing', 'strepsiptera', 'strepsipterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'parasite', 'endoparasite'],
    'thysanopterology': ['thrip', 'thysanoptera', 'thysanopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'plant', 'feeding'],
    'psocopterology': ['bark', 'louse', 'psocoptera', 'psocopterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'feeding', 'detritus'],
    'phthirapterology': ['louse', 'phthiraptera', 'phthirapterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'parasite', 'host'],
    'zorapterology': ['zorapteran', 'zoraptera', 'zorapterology', 'species', 'identification', 'classification', 'habitat', 'behavior', 'social', 'colony']
  };

  // Normaliza a categoria para minúsculas
  const normalizedCategory = category.toLowerCase();
  
  // Procura por correspondências parciais
  for (const [key, keywords] of Object.entries(categoryMap)) {
    if (normalizedCategory.includes(key)) {
      return keywords;
    }
  }
  
  // Retorna palavras-chave genéricas se não encontrar correspondência
  return ['concept', 'topic', 'subject', 'theme', 'idea', 'knowledge', 'information', 'learning', 'education', 'study'];
}

// Function to improve keyword extraction
function improveSearchQuery(text: string, answer?: string, category?: string): string {
  // Preserva aspas e hífens que podem ser importantes para nomes próprios
  const cleanText = text.toLowerCase()
    .replace(/[.,\\/#!$%\\^&\\*;:{}=\\-_`~()]/g, ' ')
    .replace(/\\s{2,}/g, ' ')
    .replace(/[0-9]/g, '');

  // Divide o texto em palavras
  const words = cleanText.split(' ');

  // Lista reduzida de palavras comuns em inglês para filtrar
  const stopWords = new Set([
    'what', 'which', 'how', 'for', 'with', 'without', 'by', 'about', 'between', 'during',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must', 'need', 'used', 'such', 'like', 'as',
    'when', 'where', 'why', 'who', 'whom', 'whose', 'if', 'then', 'than', 'so',
    'because', 'therefore', 'however', 'more', 'most', 'some', 'any', 'all', 'both',
    'each', 'every', 'either', 'neither', 'other', 'another', 'much', 'many', 'few',
    'little', 'several', 'enough', 'too', 'very', 'quite', 'rather', 'almost', 'nearly',
    'just', 'only', 'even', 'still', 'also', 'again', 'ever', 'never', 'always', 'often',
    'sometimes', 'usually', 'rarely', 'seldom', 'once', 'twice', 'here', 'there', 'now',
    'then', 'today', 'tomorrow', 'yesterday', 'ago', 'before', 'after', 'since', 'until',
    'while', 'during', 'through', 'throughout', 'across', 'along', 'around', 'behind',
    'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'from', 'in', 'inside',
    'into', 'near', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'through',
    'to', 'toward', 'under', 'underneath', 'up', 'upon', 'within', 'without'
  ]);

  // Identifica entidades nomeadas (nomes próprios, títulos de filmes, etc.)
  const namedEntities = new Set<string>();
  
  // Procura por padrões comuns de entidades nomeadas
  const patterns = [
    /"([^"]+)"/g,  // Texto entre aspas
    /'([^']+)'/g,  // Texto entre aspas simples
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g  // Palavras com inicial maiúscula
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Remove as aspas se presentes
        const entity = match.replace(/["']/g, '').toLowerCase();
        if (entity.length > 2) {
          namedEntities.add(entity);
        }
      });
    }
  }
  
  // Filtra palavras comuns e vazias, mas preserva entidades nomeadas
  const filteredWords = words.filter(word => 
    (word.length > 2 && !stopWords.has(word)) || 
    namedEntities.has(word)
  );

  // Adiciona a categoria se disponível
  let searchTerms = [...filteredWords];
  if (category) {
    const categoryWords = category.toLowerCase().split(' ');
    searchTerms = [...searchTerms, ...categoryWords.filter(word => !stopWords.has(word))];
  }
  
  // Adiciona palavras-chave da resposta se disponível
  if (answer) {
    const cleanAnswer = answer.toLowerCase()
      .replace(/[.,\\/#!$%\\^&\\*;:{}=\\-_`~()]/g, ' ')
      .replace(/\\s{2,}/g, ' ')
      .replace(/[0-9]/g, '');
    
    const answerWords = cleanAnswer.split(' ');
    const filteredAnswerWords = answerWords.filter(word => 
      word.length > 2 && 
      !stopWords.has(word)
    );
    
    // Prioriza as palavras da resposta, pois são geralmente mais relevantes
    searchTerms = [...filteredAnswerWords, ...searchTerms];
  }
  
  // Obtém palavras-chave relacionadas usando o mapeamento semântico
  const relatedKeywords = getRelatedKeywordsForTerms(searchTerms);
  
  // Adiciona termos visuais específicos com base no contexto
  const visualTerms = extractVisualTerms(text, answer);
  searchTerms = [...searchTerms, ...relatedKeywords, ...visualTerms];
  
  // Remove duplicatas
  searchTerms = [...new Set(searchTerms)];
  
  // Limita a 15 termos para não sobrecarregar a busca
  return searchTerms.slice(0, 15).join(' ');
}

// Função para extrair termos visuais específicos com base no contexto
function extractVisualTerms(text: string, answer?: string): string[] {
  const visualTerms = new Set<string>();
  
  // Termos relacionados a filmes
  if (text.includes('filme') || text.includes('movie') || text.includes('cinema')) {
    visualTerms.add('movie scene');
    visualTerms.add('film scene');
    visualTerms.add('cinema');
    visualTerms.add('movie poster');
  }
  
  // Termos relacionados a personagens
  if (text.includes('personagem') || text.includes('character') || text.includes('protagonista')) {
    visualTerms.add('character');
    visualTerms.add('protagonist');
    visualTerms.add('actor');
    visualTerms.add('actress');
  }
  
  // Termos relacionados a robôs
  if (text.includes('robô') || text.includes('robot') || text.includes('droid')) {
    visualTerms.add('robot');
    visualTerms.add('droid');
    visualTerms.add('android');
    visualTerms.add('mechanical');
  }
  
  // Termos relacionados a máscaras
  if (text.includes('mascarado') || text.includes('masked') || text.includes('máscara') || text.includes('mask')) {
    visualTerms.add('masked');
    visualTerms.add('mask');
    visualTerms.add('face mask');
    visualTerms.add('costume');
  }
  
  // Termos específicos para Star Wars
  if (text.includes('star wars') || text.includes('guerra nas estrelas')) {
    visualTerms.add('star wars');
    visualTerms.add('bb-8');
    visualTerms.add('droid');
    visualTerms.add('robot');
    visualTerms.add('orange and white');
  }
  
  // Termos específicos para V de Vingança
  if (text.includes('v de vingança') || text.includes('v for vendetta')) {
    visualTerms.add('v for vendetta');
    visualTerms.add('masked');
    visualTerms.add('guy fawkes mask');
    visualTerms.add('revolution');
  }
  
  // Adiciona termos específicos da resposta se disponível
  if (answer) {
    const answerLower = answer.toLowerCase();
    
    // Termos específicos para BB-8
    if (answerLower.includes('bb-8') || answerLower.includes('bb8')) {
      visualTerms.add('bb-8');
      visualTerms.add('star wars droid');
      visualTerms.add('orange and white robot');
    }
    
    // Termos específicos para 5 de novembro
    if (answerLower.includes('5 de novembro') || answerLower.includes('november 5')) {
      visualTerms.add('guy fawkes');
      visualTerms.add('v for vendetta');
      visualTerms.add('masked revolution');
    }
  }
  
  return Array.from(visualTerms);
}

// Function to score image relevance
function scoreImageRelevance(image: any, query: string, category?: string): number {
  let score = 0;
  const searchTerms = query.toLowerCase().split(' ');
  const description = (image.description || '').toLowerCase();
  
  // Tratamento de tags para diferentes formatos de API
  let tags: string[] = [];
  if (Array.isArray(image.tags)) {
    // Formato Unsplash: array de objetos com propriedade 'title'
    tags = image.tags.map((tag: any) => 
      typeof tag === 'object' && tag.title ? tag.title.toLowerCase() : String(tag).toLowerCase()
    );
  } else if (typeof image.tags === 'string') {
    // Formato Pixabay: string separada por vírgulas
    tags = image.tags.split(', ').map((tag: string) => tag.toLowerCase());
  }
  
  const altDescription = (image.alt_description || '').toLowerCase();
  
  // Pontuação base para cada imagem
  score += 10;
  
  // Verifica se a descrição contém termos da busca
  for (const term of searchTerms) {
    if (description.includes(term)) {
      score += 5;
    }
    if (altDescription.includes(term)) {
      score += 3;
    }
  }
  
  // Verifica se as tags contêm termos da busca
  for (const term of searchTerms) {
    const matchingTags = tags.filter((tag: string) => tag.includes(term));
    score += matchingTags.length * 2;
  }
  
  // Adiciona pontos para imagens com boa qualidade
  if (image.width > 2000 && image.height > 1500) {
    score += 3;
  }
  
  // Adiciona pontos para imagens com proporção adequada (16:9)
  const ratio = image.width / image.height;
  if (ratio >= 1.5 && ratio <= 1.8) {
    score += 5;
  }
  
  // Adiciona pontos para imagens com cores vibrantes
  if (image.color && image.color !== '#000000' && image.color !== '#FFFFFF') {
    score += 2;
  }
  
  // Adiciona pontos para imagens com muitos likes
  if (image.likes > 100) {
    score += 2;
  }
  
  // Adiciona pontos para imagens com muitos downloads
  if (image.downloads > 50) {
    score += 2;
  }
  
  // Adiciona pontos para imagens com muitos views
  if (image.views > 1000) {
    score += 2;
  }
  
  return score;
}

// Interface para padronizar os resultados de diferentes APIs
interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  description: string;
  tags: string[];
  source: string; // 'unsplash', 'pexels', 'pixabay'
  score: number;
}

// Função para buscar imagens no Unsplash
async function searchUnsplashImages(query: string, category?: string): Promise<ImageResult[]> {
  try {
    console.log(`Searching Unsplash for: "${query}"`);
    
    // Limitar o tamanho da consulta para evitar erros
    const limitedQuery = query.split(' ').slice(0, 10).join(' ');
    console.log(`Limited query for Unsplash: "${limitedQuery}"`);
    
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      params: {
        query: limitedQuery,
        per_page: 10,
        orientation: 'landscape',
        content_filter: 'high',
        order_by: 'relevant'
      }
    });

    if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
      console.error('Resposta inválida do Unsplash:', response.data);
      return [];
    }

    const results = response.data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.thumb,
      width: photo.width,
      height: photo.height,
      description: photo.description || photo.alt_description || '',
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      source: 'unsplash',
      score: scoreImageRelevance(photo, query, category)
    }));

    return results;
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return [];
  }
}

// Função para buscar imagens no Pexels
async function searchPexelsImages(query: string, category?: string): Promise<ImageResult[]> {
  try {
    console.log(`Searching Pexels for: "${query}"`);
    
    // Limitar o tamanho da consulta para evitar erros
    const limitedQuery = query.split(' ').slice(0, 10).join(' ');
    console.log(`Limited query for Pexels: "${limitedQuery}"`);
    
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: PEXELS_API_KEY
      },
      params: {
        query: limitedQuery,
        per_page: 10,
        orientation: 'landscape'
      }
    });

    // Verificar se a resposta contém fotos
    if (!response.data || !response.data.photos || !Array.isArray(response.data.photos)) {
      console.error('Resposta inválida do Pexels:', response.data);
      return [];
    }

    const results = response.data.photos.map((photo: any) => {
      // Adiciona tags vazias para evitar erros na função scoreImageRelevance
      const photoWithTags = {
        ...photo,
        tags: [],
        alt_description: photo.alt || ''
      };
      
      return {
        id: photo.id.toString(),
        url: photo.src.large2x,
        thumbnailUrl: photo.src.medium,
        width: photo.width,
        height: photo.height,
        description: photo.alt || '',
        tags: [],
        source: 'pexels',
        score: scoreImageRelevance(photoWithTags, query, category)
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching Pexels:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return [];
  }
}

// Função para buscar imagens no Pixabay
async function searchPixabayImages(query: string, category?: string): Promise<ImageResult[]> {
  try {
    console.log(`Searching Pixabay for: "${query}"`);
    
    // Limitar o tamanho da consulta para evitar erros 400
    const limitedQuery = query.split(' ').slice(0, 10).join(' ');
    console.log(`Limited query for Pixabay: "${limitedQuery}"`);
    
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: limitedQuery,
        per_page: 10,
        orientation: 'horizontal',
        safesearch: true,
        order: 'popular'
      }
    });

    if (!response.data || !response.data.hits) {
      console.error('Resposta inválida do Pixabay:', response.data);
      return [];
    }

    const results = response.data.hits.map((photo: any) => ({
      id: photo.id.toString(),
      url: photo.largeImageURL,
      thumbnailUrl: photo.previewURL,
      width: photo.imageWidth,
      height: photo.imageHeight,
      description: photo.tags || '',
      tags: typeof photo.tags === 'string' ? photo.tags.split(', ') : [],
      source: 'pixabay',
      score: scoreImageRelevance(photo, query, category)
    }));

    return results;
  } catch (error) {
    console.error('Error searching Pixabay:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return [];
  }
}

// Função para buscar imagens em todas as fontes
async function searchAllImageSources(query: string, category?: string): Promise<ImageResult[]> {
  console.log(`Searching all image sources for: "${query}"`);
  
  // Busca em paralelo em todas as fontes
  const [unsplashResults, pexelsResults, pixabayResults] = await Promise.all([
    searchUnsplashImages(query, category),
    searchPexelsImages(query, category),
    searchPixabayImages(query, category)
  ]);
  
  // Combina todos os resultados
  const allResults = [...unsplashResults, ...pexelsResults, ...pixabayResults];
  
  // Ordena por pontuação de relevância
  allResults.sort((a, b) => b.score - a.score);
  
  // Retorna os 10 melhores resultados
  return allResults.slice(0, 10);
}

// Função para baixar e redimensionar a imagem
async function downloadAndResizeImage(imageUrl: string, questionId: number, optionIndex: number): Promise<string> {
  try {
    // Create directory if it doesn't exist
    const dirPath = path.join(process.cwd(), '..', 'frontend', 'public', 'questions', questionId.toString());
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Load image
    const image = await loadImage(buffer);
    
    // Calculate dimensions for 16:9 aspect ratio
    const targetWidth = 800;
    const targetHeight = 450;
    
    // Create canvas
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    // Fill background with white only if the image is not PNG
    if (!imageUrl.toLowerCase().endsWith('.png')) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    // Calculate dimensions to maintain aspect ratio
    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    let offsetX = 0;
    let offsetY = 0;
    
    const imageRatio = image.width / image.height;
    const targetRatio = targetWidth / targetHeight;
    
    if (imageRatio > targetRatio) {
      // Image is wider than target
      drawHeight = targetHeight;
      drawWidth = drawHeight * imageRatio;
      offsetX = (targetWidth - drawWidth) / 2;
    } else {
      // Image is taller than target
      drawWidth = targetWidth;
      drawHeight = drawWidth / imageRatio;
      offsetY = (targetHeight - drawHeight) / 2;
    }
    
    // Draw image
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    
    // Determine file extension based on source image
    const isPNG = imageUrl.toLowerCase().endsWith('.png');
    const fileExtension = isPNG ? 'png' : 'jpg';
    const fileName = `image_${optionIndex + 1}.${fileExtension}`;
    const filePath = path.join(dirPath, fileName);
    const out = fs.createWriteStream(filePath);
    
    // Create appropriate stream based on file type
    const stream = isPNG 
      ? canvas.createPNGStream()
      : canvas.createJPEGStream({ quality: 0.9 });
    
    return new Promise((resolve, reject) => {
      stream.pipe(out);
      out.on('finish', () => {
        console.log(`Imagem salva em: ${filePath}`);
        resolve(`/questions/${questionId}/${fileName}`);
      });
      out.on('error', reject);
    });
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw error;
  }
}

// Função para salvar as opções de imagem em um arquivo JSON
async function saveImageOptions(questionId: number, images: ImageResult[]) {
  const optionsDir = path.join(process.cwd(), '..', 'frontend', 'public', 'questions', questionId.toString(), 'options');
  
  // Cria o diretório de opções se não existir
  if (!fs.existsSync(optionsDir)) {
    fs.mkdirSync(optionsDir, { recursive: true });
  }

  // Processa e salva cada imagem
  const processedImages = await Promise.all(
    images.map(async (image, index) => {
      const imagePath = await downloadAndResizeImage(image.url, questionId, index);
      return {
        ...image,
        url: imagePath // Usa o caminho processado retornado por downloadAndResizeImage
      };
    })
  );

  // Salva as opções em um arquivo JSON
  const optionsPath = path.join(optionsDir, 'options.json');
  fs.writeFileSync(optionsPath, JSON.stringify({ images: processedImages }, null, 2));
  console.log(`Opções de imagem salvas em: ${optionsPath}`);
}

// Função principal para encontrar imagens para as questões
async function findImagesForQuestions(questionIds?: number[]) {
  try {
    console.log('Iniciando processamento de imagens para questões...');
    
    // Se IDs específicos foram fornecidos, processa apenas essas questões
    if (questionIds && questionIds.length > 0) {
      console.log(`Processando ${questionIds.length} questões específicas: ${questionIds.join(', ')}`);
      
      // Busca as questões específicas
      const questions = await prisma.question.findMany({
        where: {
          id: {
            in: questionIds
          }
        }
      });
      
      if (questions.length === 0) {
        console.error('Nenhuma questão encontrada com os IDs fornecidos');
        return;
      }
      
      console.log(`Encontradas ${questions.length} questões para processamento`);
      
      // Processa cada questão
      for (const question of questions) {
        await processQuestion(question);
      }
    } else {
      // Se nenhum ID foi fornecido, busca todas as questões selecionadas
      console.log('Nenhum ID específico fornecido, buscando todas as questões selecionadas');
      
      // Busca a seleção de questões mais recente
      const selectedQuestions = await prisma.selectedQuestions.findFirst({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (!selectedQuestions) {
        console.error('Nenhuma seleção de questões ativa encontrada');
        return;
      }
      
      console.log(`Encontrada seleção de questões com ID ${selectedQuestions.id}`);
      
      // Busca as questões da seleção
      const questions = await prisma.question.findMany({
        where: {
          id: {
            in: selectedQuestions.questionIds
          }
        }
      });
      
      console.log(`Encontradas ${questions.length} questões para processamento`);
      
      // Processa cada questão
      for (const question of questions) {
        await processQuestion(question);
      }
    }
    
    console.log('Processamento de imagens concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao processar imagens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função auxiliar para processar uma única questão
async function processQuestion(question: any) {
  try {
    console.log(`Processando questão ${question.id}: ${question.text}`);
    
    // Traduz o texto da questão e a resposta correta para inglês
    const translatedText = await translateToEnglish(question.text);
    const translatedAnswer = await translateToEnglish(question.correctAnswer);
    
    console.log(`Texto traduzido: ${translatedText}`);
    console.log(`Resposta traduzida: ${translatedAnswer}`);
    
    // Extrai o contexto principal da questão
    const context = extractMainContext(translatedText);
    console.log(`Contexto extraído: ${context}`);
    
    // Melhora a query de busca
    const searchQuery = improveSearchQuery(context, translatedAnswer);
    console.log(`Query de busca melhorada: ${searchQuery}`);
    
    // Busca imagens
    const images = await searchAllImageSources(searchQuery);
    console.log(`Encontradas ${images.length} imagens`);
    
    // Salva as opções de imagem
    if (images.length > 0) {
      await saveImageOptions(question.id, images);
      
      // Baixa e redimensiona a primeira imagem como imagem principal
      const mainImage = images[0];
      const imagePath = await downloadAndResizeImage(mainImage.url, question.id, 1);
      
      // Atualiza o banco de dados com o caminho da imagem
      await prisma.question.update({
        where: { id: question.id },
        data: { scrImage: imagePath }
      });
      
      console.log(`Imagem principal atualizada para a questão ${question.id}: ${imagePath}`);
    } else {
      console.log(`Nenhuma imagem encontrada para a questão ${question.id}`);
    }
  } catch (error) {
    console.error(`Erro ao processar questão ${question.id}:`, error);
  }
}

// Executa o script
const questionIds = process.argv.slice(2).map(id => parseInt(id));
findImagesForQuestions(questionIds.length > 0 ? questionIds : undefined); 