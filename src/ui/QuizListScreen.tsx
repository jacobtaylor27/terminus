import type { Quiz } from '../quiz/quiz.ts'

interface QuizListScreenProps {
  quizzes: readonly Quiz[]
  onChoose: (quiz: Quiz) => void
}

export function QuizListScreen({ quizzes, onChoose }: QuizListScreenProps) {
  return (
    <main className="page">
      <h1 className="app-title">Terminus</h1>
      <h2 className="page-heading">Choose a Quiz</h2>
      <ul className="quiz-list">
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <button type="button" className="quiz-card" onClick={() => onChoose(quiz)}>
              {quiz.title}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
