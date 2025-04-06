import express from 'express';
import cors from 'cors';
import questionsRouter from './routes/questions.js';
import categoriesRouter from './routes/categories.js';
import quizRouter from './routes/quiz.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Rotas
console.log('Registrando rotas...');
app.use('/api/questions', questionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/quiz', quizRouter);

// Servir arquivos estáticos do diretório public
const publicPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'questions');
console.log('Diretório de arquivos estáticos:', publicPath);

// Middleware para logar requisições de arquivos estáticos
app.use('/questions', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Requisição de arquivo estático: ${req.url}`);
  next();
}, express.static(publicPath));

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
  console.log('- GET /questions/* (arquivos estáticos)');
}); 