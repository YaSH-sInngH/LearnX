import { Quiz, QuizAttempt, Module, Enrollment } from '../models/index.js';

export const submitQuiz = async (req, res) => {
  try {
    const { moduleId, answers } = req.body;
    
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Quiz,
        required: true
      }, {
        model: Track,
        attributes: ['id']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: module.Track.id
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this track' });
    }

    // Grade the quiz
    const { score, passed, correctAnswers } = gradeQuiz(
      module.Quiz.questions,
      answers,
      module.Quiz.passingScore
    );

    // Record attempt
    const attempt = await QuizAttempt.create({
      answers,
      score,
      passed,
      userId: req.user.id,
      quizId: module.Quiz.id,
      moduleId: module.id
    });

    // Update progress if passed
    if (passed) {
      await saveModuleProgress(req.user.id, module.Track.id, module.id);
    }

    res.json({
      score,
      passed,
      correctAnswers,
      attemptId: attempt.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

const gradeQuiz = (questions, userAnswers, passingScore = 70) => {
  let correctCount = 0;
  const correctAnswers = {};

  questions.forEach((q, index) => {
    const isCorrect = q.correctAnswer === userAnswers[index];
    correctAnswers[index] = isCorrect;
    if (isCorrect) correctCount++;
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passingScore;

  return { score, passed, correctAnswers };
};

const saveModuleProgress = async (userId, trackId, moduleId) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, trackId }
  });

  if (!enrollment) return;

  const progressData = enrollment.progressData || {};
  progressData[moduleId] = {
    ...(progressData[moduleId] || {}),
    completed: true,
    quizCompleted: true
  };

  const completedModules = [...new Set([
    ...enrollment.completedModules,
    moduleId
  ])];

  const totalModules = await Module.count({ where: { trackId } });
  const progress = Math.round((completedModules.length / totalModules) * 100);

  await enrollment.update({
    progressData,
    completedModules,
    progress
  });
};

export const getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: {
        userId: req.user.id,
        moduleId: req.params.moduleId
      },
      order: [['completedAt', 'DESC']],
      attributes: ['id', 'score', 'passed', 'completedAt']
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get attempts' });
  }
};