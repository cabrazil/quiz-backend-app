import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

async function createDefaultImage() {
  try {
    // Caminho para o diretório default
    const defaultDir = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'questions', 'default');
    
    // Cria o diretório se não existir
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    
    // Cria uma imagem padrão
    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext('2d');
    
    // Preenche o fundo com uma cor gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, '#4f46e5'); // Indigo
    gradient.addColorStop(1, '#7c3aed'); // Violet
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 450);
    
    // Adiciona texto
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cuca Legal', 400, 225);
    
    // Salva a imagem
    const filePath = path.join(defaultDir, 'image_1.jpg');
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createJPEGStream({ quality: 0.9 });
    stream.pipe(out);
    
    return new Promise((resolve, reject) => {
      out.on('finish', () => {
        console.log(`Imagem padrão criada em: ${filePath}`);
        resolve(filePath);
      });
      out.on('error', reject);
    });
  } catch (error) {
    console.error('Erro ao criar imagem padrão:', error);
    throw error;
  }
}

// Executa a função
createDefaultImage()
  .then(() => console.log('Processo concluído com sucesso!'))
  .catch(error => console.error('Erro:', error)); 