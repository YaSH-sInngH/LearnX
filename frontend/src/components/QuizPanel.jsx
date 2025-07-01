import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getQuizAttempts, autoGenerateQuiz } from '../api/tracks';
import { toast } from 'react-toastify';
import BadgeUnlockModal from './BadgeUnlockModal';
import AIAssistantPanel from './AIAssistantPanel';

export default function QuizPanel({ 
  moduleId, 
  module, 
  activeTab, 
  onTabChange, 
  onSubmitQuiz, 
  isCompleted = false 
}) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    if (module?.quiz) {
      setQuiz(module.quiz);
      // Initialize answers object
      const initialAnswers = {};
      module.quiz.questions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setCurrentAnswers(initialAnswers);
    }
    fetchQuizAttempts();
  }, [moduleId, module]);

  const fetchQuizAttempts = async () => {
    try {
      const attemptsData = await getQuizAttempts(moduleId);
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.values(currentAnswers);
    if (answers.some(answer => answer === '' || answer === undefined)) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmitQuiz(answers);
      if (!result || typeof result.score !== 'number') {
        toast.error('Quiz failed. Please try again.');
        setLastResult({ score: 0, passed: false, correctAnswers: [] });
        setShowResults(true);
        return;
      }
      setLastResult(result);
      setShowResults(true);
      fetchQuizAttempts(); // Refresh attempts
      // Badge unlock animation
      if (result.newBadge) {
        setUnlockedBadge(result.newBadge);
      }
      // XP gain feedback
      if (result.xpGained) {
        setXpGained(result.xpGained);
        toast.success(`+${result.xpGained} XP!`);
      }
    } catch (error) {
      toast.error('Quiz failed. Please try again.');
      setLastResult({ score: 0, passed: false, correctAnswers: [] });
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const result = await autoGenerateQuiz(moduleId);
      if (result.quiz) {
        setQuiz(result.quiz);
        toast.success('AI quiz generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const resetQuiz = () => {
    setCurrentAnswers({});
    setShowResults(false);
    setLastResult(null);
  };

  const renderQuizQuestion = (question, index) => {
    const isAnswered = currentAnswers[index] !== '';
    const isCorrect = showResults && lastResult?.correctAnswers?.[index] === currentAnswers[index];

    return (
      <div key={index} className="mb-6 p-4 border rounded-lg">
        <div className="flex items-start space-x-2 mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Q{index + 1}.</span>
          <p className="text-sm text-gray-900 dark:text-gray-100 flex-1">{question.question}</p>
        </div>
        
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors text-gray-900 dark:text-gray-100 ${
                currentAnswers[index] === optionIndex
                  ? showResults
                    ? isCorrect
                      ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700'
                      : 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700'
                    : 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800'
              } border`}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={optionIndex}
                checked={currentAnswers[index] === optionIndex}
                onChange={() => handleAnswerChange(index, optionIndex)}
                disabled={showResults}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{option}</span>
              {showResults && (
                <span className="ml-auto">
                  {isCorrect && currentAnswers[index] === optionIndex && (
                    <span className="text-green-600">✓</span>
                  )}
                  {!isCorrect && lastResult?.correctAnswers?.[index] === optionIndex && (
                    <span className="text-green-600">✓</span>
                  )}
                  {!isCorrect && currentAnswers[index] === optionIndex && (
                    <span className="text-red-600">✗</span>
                  )}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-96 flex flex-col">
      {/* Badge Unlock Modal */}
      <BadgeUnlockModal badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />
      {/* Header with Tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => onTabChange('quiz')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'quiz'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'ai'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'quiz' && (
          <div className="p-4">
            {!quiz ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-4">No quiz available for this module</p>
                {user?.role === 'Creator' && (
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingQuiz ? 'Generating AI Quiz...' : 'Generate AI Quiz'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Quiz Header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Module Quiz</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{quiz.questions.length} questions</span>
                    <span>Passing score: {quiz.passingScore}%</span>
                  </div>
                </div>

                {/* Quiz Questions */}
                {!showResults ? (
                  <div>
                    {quiz.questions.map((question, index) => 
                      renderQuizQuestion(question, index)
                    )}
                    
                    <div className="mt-6">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || Object.values(currentAnswers).some(answer => answer === '' || answer === undefined)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Quiz Results */
                  <div className="text-center py-4">
                    <div className={`text-2xl font-bold mb-2 ${
                      lastResult.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lastResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                    </div>
                    <div className="text-lg mb-4">
                      Score: {lastResult.score}%
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {Array.isArray(lastResult?.correctAnswers)
                        ? lastResult.correctAnswers.filter((_, index) => lastResult.correctAnswers[index] === currentAnswers[index]).length
                        : 0} out of {quiz.questions.length} correct
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Quiz Attempt History */}
                {attempts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Previous Attempts</h4>
                    <div className="space-y-2">
                      {attempts.slice(0, 3).map((attempt, index) => (
                        <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900">
                          <span>Attempt {attempts.length - index}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${
                              attempt.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {attempt.score}%
                            </span>
                            <span className="text-gray-500">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <AIAssistantPanel moduleId={moduleId} module={module} />
        )}
      </div>
    </div>
  );
} 