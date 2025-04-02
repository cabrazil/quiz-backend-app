import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import questionsRouter from './routes/questions.js';
import categoriesRouter from './routes/categories.js';

const app = express();
const prisma = new PrismaClient();

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // URLs permitidas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Middleware para log de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro na requisição:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rotas
app.use('/questions', questionsRouter);
app.use('/categories', categoriesRouter);

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Servidor rodando na porta ${PORT}`);
  console.log('Rotas disponíveis:');
  console.log('- /questions');
  console.log('- /questions/:id');
  console.log('- /categories');
  console.log('- /test');
}); 