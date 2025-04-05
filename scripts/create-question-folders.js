import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para criar as pastas das questões
function createQuestionFolders(questionIds) {
  console.log('Iniciando criação de pastas para questões...');
  console.log('IDs das questões:', questionIds);

  // Caminho base para as pastas de questões
  const basePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'questions');
  console.log('Caminho base:', basePath);
  console.log('Diretório atual:', process.cwd());

  // Verifica se o diretório base existe, se não, cria
  try {
    if (!fs.existsSync(basePath)) {
      console.log('Diretório base não existe, tentando criar...');
      fs.mkdirSync(basePath, { recursive: true });
      console.log(`Diretório base criado: ${basePath}`);
    } else {
      console.log(`Diretório base já existe: ${basePath}`);
    }
  } catch (dirError) {
    console.error('Erro ao criar diretório base:', dirError);
    return;
  }

  const createdFolders = [];
  const errors = [];

  // Cria as pastas para cada questão
  for (const questionId of questionIds) {
    const folderPath = path.join(basePath, questionId.toString());
    console.log(`Tentando criar pasta: ${folderPath}`);
    
    try {
      // Verifica se a pasta já existe
      if (!fs.existsSync(folderPath)) {
        // Cria a pasta
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Pasta criada para a questão ${questionId}: ${folderPath}`);
        createdFolders.push(questionId);
      } else {
        console.log(`Pasta já existe para a questão ${questionId}: ${folderPath}`);
      }
    } catch (err) {
      console.error(`Erro ao criar pasta para a questão ${questionId}:`, err);
      errors.push({ questionId, error: err.message, path: folderPath });
    }
  }

  console.log('Processamento concluído');
  console.log('Pastas criadas:', createdFolders);
  if (errors.length > 0) {
    console.log('Erros:', errors);
  }
}

// Verifica se os IDs das questões foram fornecidos como argumentos
const questionIds = process.argv.slice(2).map(id => parseInt(id, 10));

if (questionIds.length === 0) {
  console.error('Por favor, forneça os IDs das questões como argumentos.');
  console.error('Exemplo: node create-question-folders.js 230 236 238');
  process.exit(1);
}

// Executa a função
createQuestionFolders(questionIds); 