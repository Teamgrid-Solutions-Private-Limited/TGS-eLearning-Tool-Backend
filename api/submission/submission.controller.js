const Assessment = require('../../models/assessment.model');
const Question = require('../../models/question.model');
const Submission = require('../../models/submission.model');

// Try to import xAPI service, but make it optional
let xapiService = { sendAnsweredStatement: async () => null, sendCompletedStatement: async () => null };
try {
  xapiService = require('../../services/xapiService');
} catch (error) {
  console.warn('xAPI service not available, statements will not be sent');
}

class SubmissionController {
  async submitAssessment(req, res) {
    try {
      const { answers, startTime } = req.body;
      const user = req.user; // must be populated via auth middleware
      const assessmentId = req.params.assessmentId;

      // Get assessment with populated questions
      const assessment = await Assessment.findById(assessmentId)
        .populate('questions.question');
        
      if (!assessment) {
        return res.status(404).json({ success: false, error: 'Assessment not found' });
      }

      // Check if user has reached maximum attempts
      const previousAttempts = await Submission.find({ 
        user: user._id, 
        assessment: assessment._id 
      });
      
      if (previousAttempts.length >= assessment.maxAttempts) {
        return res.status(403).json({ 
          success: false, 
          error: 'Maximum attempts reached' 
        });
      }

      // Calculate time spent if startTime was provided
      const submittedAt = new Date();
      let timeSpent = null;
      if (startTime) {
        const startTimeDate = new Date(startTime);
        timeSpent = Math.floor((submittedAt - startTimeDate) / 1000); // in seconds
      }

      // Process each question and calculate score
      let totalScore = 0;
      let maxPossibleScore = 0;
      const processedAnswers = [];

      for (const questionItem of assessment.questions) {
        const questionId = questionItem.question._id.toString();
        const question = questionItem.question;
        const weight = questionItem.weight || 1;
        const userAnswer = answers[questionId];
        
        // Skip if no answer provided
        if (userAnswer === undefined) {
          processedAnswers.push({
            questionItem: questionItem._id,
            question: questionId,
            userAnswer: null,
            isCorrect: false,
            score: 0,
            feedback: 'No answer provided'
          });
          maxPossibleScore += weight;
          continue;
        }

        // Grade based on question type
        let isCorrect = false;
        let score = 0;
        let feedback = '';

        switch (question.questionType) {
          case 'multipleChoice':
            isCorrect = this._gradeMultipleChoice(userAnswer, question);
            score = isCorrect ? weight : 0;
            feedback = isCorrect ? 'Correct!' : 'Incorrect answer';
            break;
            
          case 'trueFalse':
            isCorrect = userAnswer === question.correctAnswer;
            score = isCorrect ? weight : 0;
            feedback = isCorrect ? 'Correct!' : 'Incorrect answer';
            break;
            
          case 'shortAnswer':
            // For short answer, we might do partial matching or exact matching
            isCorrect = this._gradeShortAnswer(userAnswer, question);
            score = isCorrect ? weight : 0;
            feedback = isCorrect ? 'Correct!' : 'Incorrect answer';
            break;
            
          case 'essay':
            // Essays typically need manual grading
            score = 0; // Will be graded later
            feedback = 'This answer will be graded by an instructor';
            break;
            
          case 'matching':
            const matchScore = this._gradeMatching(userAnswer, question);
            isCorrect = matchScore === 1;
            score = matchScore * weight;
            feedback = isCorrect ? 'All matches correct!' : 'Some matches were incorrect';
            break;
            
          case 'fillInBlank':
            const blankScore = this._gradeFillInBlank(userAnswer, question);
            isCorrect = blankScore === 1;
            score = blankScore * weight;
            feedback = isCorrect ? 'All blanks filled correctly!' : 'Some blanks were incorrect';
            break;
            
          default:
            score = 0;
            feedback = 'Unknown question type';
        }

        totalScore += score;
        maxPossibleScore += weight;

        // Add to processed answers
        processedAnswers.push({
          questionItem: questionItem._id,
          question: questionId,
          userAnswer,
          isCorrect,
          score,
          feedback
        });

        // Send xAPI statement for this question if enabled
        if (assessment.type === 'quiz' || assessment.showFeedback !== 'never') {
          try {
            await xapiService.sendAnsweredStatement({
              user,
              question,
              assessment,
              userAnswer,
              correct: isCorrect
            });
          } catch (error) {
            console.error('Error sending xAPI statement:', error);
            // Continue processing even if xAPI fails
          }
        }
      }

      // Calculate percentage and pass/fail status
      const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
      const passed = percentage >= assessment.passingScore;
      const attemptNumber = previousAttempts.length + 1;

      // Create submission record
      const submission = new Submission({
        user: user._id,
        assessment: assessment._id,
        answers: processedAnswers,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        passed,
        attemptNumber,
        startTime: startTime ? new Date(startTime) : submittedAt,
        submittedAt,
        timeSpent
      });

      await submission.save();

      // Send xAPI completion statement
      try {
        await xapiService.sendCompletedStatement({
          user,
          assessment,
          score: totalScore,
          total: maxPossibleScore,
          success: passed
        });
      } catch (error) {
        console.error('Error sending xAPI completion statement:', error);
        // Continue processing even if xAPI fails
      }

      // Prepare feedback based on assessment settings
      let feedbackToReturn;
      if (assessment.showFeedback === 'always' || 
         (assessment.showFeedback === 'onCompletion' && attemptNumber >= assessment.maxAttempts)) {
        feedbackToReturn = processedAnswers.map(a => ({
          questionId: a.question,
          userAnswer: a.userAnswer,
          isCorrect: a.isCorrect,
          feedback: a.feedback
        }));
      }

      res.status(200).json({
        success: true,
        message: 'Assessment submitted',
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage: percentage.toFixed(2),
        passed,
        attemptNumber,
        timeSpent,
        feedback: feedbackToReturn
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper methods for grading different question types
  _gradeMultipleChoice(userAnswer, question) {
    // For single-select questions
    if (!Array.isArray(userAnswer)) {
      const correctOption = question.options.find(o => o.isCorrect);
      return correctOption && userAnswer === correctOption.text;
    }
    
    // For multi-select questions
    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.text);
    const userCorrect = userAnswer.every(answer => correctOptions.includes(answer));
    const allCorrect = correctOptions.every(correct => userAnswer.includes(correct));
    
    return userCorrect && allCorrect;
  }

  _gradeShortAnswer(userAnswer, question) {
    // Basic implementation - can be expanded with more sophisticated matching
    if (typeof question.correctAnswer === 'string') {
      return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    } else if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.some(answer => 
        userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
      );
    }
    return false;
  }

  _gradeMatching(userAnswer, question) {
    // Assuming userAnswer is an object mapping left side to right side
    if (!userAnswer || typeof userAnswer !== 'object') return 0;
    
    let correctCount = 0;
    let totalItems = 0;
    
    for (const [key, value] of Object.entries(userAnswer)) {
      totalItems++;
      if (question.correctAnswer[key] === value) {
        correctCount++;
      }
    }
    
    return totalItems > 0 ? correctCount / totalItems : 0;
  }

  _gradeFillInBlank(userAnswer, question) {
    // Assuming userAnswer is an array of strings for each blank
    if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return 0;
    
    let correctCount = 0;
    const totalBlanks = Math.min(userAnswer.length, question.correctAnswer.length);
    
    for (let i = 0; i < totalBlanks; i++) {
      // Allow for multiple possible correct answers per blank
      const correctForBlank = Array.isArray(question.correctAnswer[i]) 
        ? question.correctAnswer[i] 
        : [question.correctAnswer[i]];
        
      if (correctForBlank.some(correct => 
        userAnswer[i].toLowerCase().trim() === correct.toLowerCase().trim()
      )) {
        correctCount++;
      }
    }
    
    return totalBlanks > 0 ? correctCount / totalBlanks : 0;
  }

  // Get all submissions for an assessment (admin or teacher view)
  async getSubmissionsByAssessment(req, res) {
    try {
      const submissions = await Submission.find({ assessment: req.params.assessmentId })
        .populate('user', 'name email')
        .sort('-submittedAt');
        
      res.status(200).json({ 
        success: true, 
        count: submissions.length, 
        data: submissions 
      });
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
      }).sort('-submittedAt');
      
      res.status(200).json({ 
        success: true, 
        data: submissions 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Get detailed submission with answers
  async getSubmissionDetails(req, res) {
    try {
      const submission = await Submission.findById(req.params.submissionId)
        .populate('user', 'name email')
        .populate('assessment')
        .populate({
          path: 'answers.question',
          model: 'Question'
        });
      
      if (!submission) {
        return res.status(404).json({ 
          success: false, 
          error: 'Submission not found' 
        });
      }
      
      // Check if the user is authorized to view this submission
      const isOwner = submission.user._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'instructor';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Not authorized to view this submission' 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        data: submission 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // Grade an essay question (for instructors)
  async gradeEssayQuestion(req, res) {
    try {
      const { submissionId, questionId, score, feedback } = req.body;
      
      if (!submissionId || !questionId || score === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }
      
      const submission = await Submission.findById(submissionId);
      
      if (!submission) {
        return res.status(404).json({ 
          success: false, 
          error: 'Submission not found' 
        });
      }
      
      // Find the answer to update
      const answerIndex = submission.answers.findIndex(
        a => a.question.toString() === questionId
      );
      
      if (answerIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: 'Question not found in this submission' 
        });
      }
      
      // Update the answer
      submission.answers[answerIndex].score = score;
      submission.answers[answerIndex].feedback = feedback || '';
      
      // Recalculate total score
      let totalScore = 0;
      for (const answer of submission.answers) {
        totalScore += answer.score || 0;
      }
      
      submission.score = totalScore;
      submission.percentage = (totalScore / submission.maxScore) * 100;
      submission.passed = submission.percentage >= submission.assessment.passingScore;
      
      await submission.save();
      
      res.status(200).json({ 
        success: true, 
        data: submission 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SubmissionController();
