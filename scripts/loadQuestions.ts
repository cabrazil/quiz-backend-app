import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { translateText } from '../src/services/translateServiceFix';

const prisma = new PrismaClient();

async function loadQuestions() {
  try {
    // Buscar a categoria "Conhecimentos Gerais"
    const category = await prisma.category.findFirst({
      where: { name: 'Conhecimentos Gerais' }
    });

    if (!category) {
      console.log('Categoria "Conhecimentos Gerais" não encontrada');
      return;
    }

    console.log(`\nCategoria encontrada: ${category.name} (ID: ${category.id})`);

    // Verificar questões existentes
    const existingQuestions = await prisma.question.findMany({
      where: {
        categoryId: category.id,
        difficulty: 'HARD'
      }
    });

    console.log(`\nQuestões existentes: ${existingQuestions.length}`);

    if (existingQuestions.length < 5) {
      console.log('\nCarregando novas questões...');

      // Buscar questões da API
      const response = await axios.get('https://opentdb.com/api.php?amount=10&category=9&type=multiple');
      const questions = response.data.results;

      console.log(`\nEncontradas ${questions.length} questões na API`);

      // Processar cada questão
      for (const apiQuestion of questions) {
        try {
          // Traduzir a questão e as respostas
          const translatedQuestion = await translateText(apiQuestion.question);
          const translatedCorrectAnswer = await translateText(apiQuestion.correct_answer);
          const translatedOptions = await Promise.all(
            apiQuestion.incorrect_answers.map((opt: string) => translateText(opt))
          );

          // Adicionar a resposta correta às opções
          translatedOptions.push(translatedCorrectAnswer);

          // Embaralhar as opções
          const shuffledOptions = translatedOptions.sort(() => Math.random() - 0.5);

          // Criar a questão no banco de dados
          await prisma.question.create({
            data: {
              text: translatedQuestion,
              categoryId: category.id,
              difficulty: apiQuestion.difficulty.toUpperCase(),
              correctAnswer: translatedCorrectAnswer,
              options: shuffledOptions
            }
          });

          console.log(`Questão traduzida e criada com sucesso: ${translatedQuestion.substring(0, 50)}...`);
          
          // Aguardar 1 segundo entre as traduções
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Erro ao processar questão:', error);
          continue;
        }
      }

      console.log('\nProcesso de carregamento concluído!');
    } else {
      console.log('\nJá existem questões suficientes no banco de dados.');
    }

  } catch (error) {
    console.error('Erro ao carregar questões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loadQuestions(); 