import express from 'express';
import cors from 'cors';
import questionsRouter from './routes/questions.js';
import categoriesRouter from './routes/categories.js';
import quizRouter from './routes/quiz.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando!' });
});

// Rotas
console.log('Registrando rotas...');
app.use('/api/questions', questionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/quiz', quizRouter);
console.log('Rotas registradas com sucesso!');

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Servidor rodando na porta ${port}`);
  console.log('Rotas disponíveis:');
  console.log('- GET /');
  console.log('- GET /api/categories');
  console.log('- POST /api/questions/selected');
  console.log('- GET /api/questions/selected');
  console.log('- DELETE /api/questions/selected');
}); 