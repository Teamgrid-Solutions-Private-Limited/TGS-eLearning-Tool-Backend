const Assessment = require('../models/assessment.model');
const Submission = require('../models/submission.model');
const { sendAnsweredStatement, sendCompletedStatement } = require('../services/xapiService');

class SubmissionController {
  async submitAssessment(req, res) {
    try {
      const { answers } = req.body;
      const user = req.user; // must be populated via auth middleware
      const assessmentId = req.params.assessmentId;

      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ success: false, error: 'Assessment not found' });
      }

      const previousAttempts = await Submission.find({ user: user._id, assessment: assessment._id });
      if (previousAttempts.length >= assessment.maxAttempts) {
        return res.status(403).json({ success: false, error: 'Maximum attempts reached' });
      }

      const questions = assessment.questions || [];
      let score = 0;
      const feedback = [];

      for (const q of questions) {
        const qid = q._id?.toString() || q.id;
        const userAnswer = answers[qid];
        const correctAnswer = q.correctAnswer;

        const isCorrect = userAnswer === correctAnswer;
        if (isCorrect) score++;

        // xAPI per-question
        if (assessment.type === 'quiz' || assessment.showFeedback !== 'never') {
          await sendAnsweredStatement({
            user,
            question: q,
            assessment,
            userAnswer,
            correct: correctAnswer
          });
        }

        feedback.push({
          questionId: qid,
          userAnswer,
          correctAnswer: assessment.showFeedback !== 'never' ? correctAnswer : undefined,
          isCorrect
        });
      }

      const percentage = (score / questions.length) * 100;
      const passed = percentage >= assessment.passingScore;
      const attemptNumber = previousAttempts.length + 1;

      const submission = new Submission({
        user: user._id,
        assessment: assessment._id,
        answers,
        score,
        percentage,
        passed,
        attemptNumber
      });

      await submission.save();

      // xAPI submission-level
      await sendCompletedStatement({
        user,
        assessment,
        score,
        total: questions.length,
        success: passed
      });

      res.status(200).json({
        success: true,
        message: 'Assessment submitted',
        score,
        percentage: percentage.toFixed(2),
        passed,
        attemptNumber,
        feedback: assessment.showFeedback !== 'never' ? feedback : undefined
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all submissions for an assessment (admin or teacher view)
  async getSubmissionsByAssessment(req, res) {
    try {
      const submissions = await Submission.find({ assessment: req.params.assessmentId })
        .populate('user', 'name email')
        .sort('-createdAt');
      res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get user's submissions for a specific assessment
  async getUserSubmissions(req, res) {
    try {
      const submissions = await Submission.find({
        user: req.user._id,
        assessment: req.params.assessmentId
      }).sort('-createdAt');
      res.status(200).json({ success: true, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SubmissionController();
