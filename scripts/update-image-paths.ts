import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImagePaths() {
  try {
    console.log('Iniciando atualização dos caminhos de imagens...');
    
    // Busca todas as questões com imagens
    const questions = await prisma.question.findMany({
      where: {
        scrImage: {
          not: null
        }
      }
    });
    
    console.log(`Encontradas ${questions.length} questões com imagens`);
    
    let updatedCount = 0;
    
    // Processa cada questão
    for (const question of questions) {
      if (!question.scrImage) continue;
      
      let newPath = question.scrImage;
      
      // Se o caminho começa com /src/assets/questions/, atualiza para /questions/
      if (question.scrImage.startsWith('/src/assets/questions/')) {
        newPath = question.scrImage.replace('/src/assets/questions/', '/questions/');
      } 
      // Se o caminho não está no formato esperado, tenta extrair o ID da questão
      else if (!question.scrImage.startsWith('/questions/')) {
        const match = question.scrImage.match(/\/(\d+)\//);
        if (match) {
          const questionId = match[1];
          newPath = `/questions/${questionId}/image_1.jpg`;
        }
      }
      
      // Atualiza o caminho da imagem no banco de dados
      if (newPath !== question.scrImage) {
        await prisma.question.update({
          where: { id: question.id },
          data: { scrImage: newPath }
        });
        console.log(`Questão ${question.id}: ${question.scrImage} -> ${newPath}`);
        updatedCount++;
      }
    }
    
    console.log(`Atualização concluída! ${updatedCount} caminhos atualizados.`);
    
  } catch (error) {
    console.error('Erro durante a atualização dos caminhos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a função principal
updateImagePaths(); 