import { useQuiz } from './hooks/useQuiz';
import ConfigPage from './components/ConfigPage';
import RegisterPage from './components/RegisterPage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';
import SubmittingPage from './components/SubmittingPage';

export default function App() {
  const {
    phase,
    userName,
    questions,
    answers,
    currentIndex,
    timeLeft,
    result,
    loading,
    error,
    submitStatus,
    configDone,
    startQuiz,
    selectAnswer,
    goToQuestion,
    finishQuiz,
    resetQuiz,
    goToConfig,
  } = useQuiz();

  switch (phase) {
    case 'config':
      return <ConfigPage onDone={configDone} />;

    case 'register':
      return (
        <RegisterPage
          onStart={startQuiz}
          loading={loading}
          error={error}
          onReconfigure={goToConfig}
        />
      );

    case 'quiz':
      return (
        <QuizPage
          userName={userName}
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          timeLeft={timeLeft}
          onSelectAnswer={selectAnswer}
          onGoToQuestion={goToQuestion}
          onFinish={finishQuiz}
        />
      );

    case 'submitting':
      return <SubmittingPage />;

    case 'result':
      return result ? (
        <ResultPage
          result={result}
          submitStatus={submitStatus}
          onReset={resetQuiz}
        />
      ) : null;

    default:
      return null;
  }
}
