import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { id: 9, name: 'Conhecimentos Gerais' },
  { id: 10, name: 'Entretenimento: Livros' },
  { id: 11, name: 'Entretenimento: Cinema' },
  { id: 12, name: 'Entretenimento: Música' },
  { id: 13, name: 'Entretenimento: Musicais e Teatro' },
  { id: 14, name: 'Entretenimento: Televisão' },
  { id: 15, name: 'Entretenimento: Jogos Eletrônicos' },
  { id: 16, name: 'Entretenimento: Jogos de Tabuleiro' },
  { id: 17, name: 'Ciência e Natureza' },
  { id: 18, name: 'Ciência: Computadores' },
  { id: 19, name: 'Ciência: Matemática' },
  { id: 20, name: 'Mitologia' },
  { id: 21, name: 'Esportes' },
  { id: 22, name: 'Geografia' },
  { id: 23, name: 'História' },
  { id: 24, name: 'Política' },
  { id: 25, name: 'Arte' },
  { id: 26, name: 'Celebridades' },
  { id: 27, name: 'Animais' },
  { id: 28, name: 'Veículos' },
  { id: 29, name: 'Entretenimento: Quadrinhos' },
  { id: 30, name: 'Ciência: Gadgets' }
]

async function main() {
  try {
    // Limpa as tabelas
    await prisma.question.deleteMany()
    await prisma.category.deleteMany()

    // Insere as categorias
    for (const category of categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          description: `Categoria de ${category.name}`
        }
      })
    }

    console.log('Categorias populadas com sucesso!')
  } catch (error) {
    console.error('Erro ao popular categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 