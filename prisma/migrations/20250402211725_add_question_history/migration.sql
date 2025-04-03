-- CreateTable
CREATE TABLE "QuestionHistory" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "quizSessionId" INTEGER,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedQuestions" (
    "id" SERIAL NOT NULL,
    "questionIds" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectedQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionHistory_questionId_idx" ON "QuestionHistory"("questionId");

-- CreateIndex
CREATE INDEX "QuestionHistory_usedAt_idx" ON "QuestionHistory"("usedAt");

-- CreateIndex
CREATE INDEX "QuestionHistory_quizSessionId_idx" ON "QuestionHistory"("quizSessionId");

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionHistory" ADD CONSTRAINT "QuestionHistory_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
