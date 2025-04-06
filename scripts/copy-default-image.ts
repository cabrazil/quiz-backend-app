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
    
    // Salva a imagem em JPG
    const jpgPath = path.join(defaultDir, 'image_1.jpg');
    const jpgOut = fs.createWriteStream(jpgPath);
    const jpgStream = canvas.createJPEGStream({ quality: 0.9 });
    
    // Salva a imagem em PNG
    const pngPath = path.join(defaultDir, 'image_1.png');
    const pngOut = fs.createWriteStream(pngPath);
    const pngStream = canvas.createPNGStream();
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = 2;
      
      const checkComplete = () => {
        completed++;
        if (completed === total) {
          console.log(`Imagens padrão criadas em: ${jpgPath} e ${pngPath}`);
          resolve([jpgPath, pngPath]);
        }
      };
      
      jpgStream.pipe(jpgOut);
      pngStream.pipe(pngOut);
      
      jpgOut.on('finish', checkComplete);
      pngOut.on('finish', checkComplete);
      
      jpgOut.on('error', reject);
      pngOut.on('error', reject);
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