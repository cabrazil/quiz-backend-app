import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function moveImages() {
  console.log('Iniciando migração de imagens...');
  
  try {
    // Busca todas as questões com imagens
    const questions = await prisma.question.findMany({
      where: {
        scrImage: {
          not: null
        }
      }
    });
    
    console.log(`Encontradas ${questions.length} questões com imagens`);
    
    // Define os diretórios de origem e destino
    const sourceBaseDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'questions');
    const destBaseDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'questions');
    
    // Cria o diretório de destino se não existir
    if (!fs.existsSync(destBaseDir)) {
      fs.mkdirSync(destBaseDir, { recursive: true });
    }
    
    // Cria o diretório default e copia a imagem padrão
    const defaultSourceDir = path.join(sourceBaseDir, 'default');
    const defaultDestDir = path.join(destBaseDir, 'default');
    
    if (!fs.existsSync(defaultDestDir)) {
      fs.mkdirSync(defaultDestDir, { recursive: true });
    }
    
    if (fs.existsSync(defaultSourceDir)) {
      const defaultImage = path.join(defaultSourceDir, 'image_1.jpg');
      if (fs.existsSync(defaultImage)) {
        fs.copyFileSync(defaultImage, path.join(defaultDestDir, 'image_1.jpg'));
        console.log('Imagem padrão copiada com sucesso');
      }
    }
    
    let movedCount = 0;
    let errorCount = 0;
    
    // Move as imagens de cada questão
    for (const question of questions) {
      const questionId = question.id.toString();
      const sourceDir = path.join(sourceBaseDir, questionId);
      const destDir = path.join(destBaseDir, questionId);
      
      // Cria o diretório de destino para a questão
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Lista os arquivos no diretório de origem
      if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        
        for (const file of files) {
          // Verifica se o arquivo é uma imagem (jpg, jpeg ou png)
          if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const sourceFile = path.join(sourceDir, file);
            const destFile = path.join(destDir, file);
            
            try {
              fs.copyFileSync(sourceFile, destFile);
              console.log(`Imagem copiada: ${file} para questão ${questionId}`);
              movedCount++;
            } catch (error) {
              console.error(`Erro ao copiar imagem ${file} da questão ${questionId}:`, error);
              errorCount++;
            }
          }
        }
      } else {
        console.log(`Diretório de origem não encontrado para questão ${questionId}: ${sourceDir}`);
      }
    }
    
    console.log('\nMigração concluída!');
    console.log(`Total de imagens movidas: ${movedCount}`);
    console.log(`Total de erros: ${errorCount}`);
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

moveImages(); 