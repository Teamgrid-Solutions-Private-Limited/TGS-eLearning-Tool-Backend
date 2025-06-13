const XapiStatement = require('../models/xapi-statement.model');

/**
 * Send an xAPI statement for an answered question
 * @param {Object} params - Parameters for the statement
 * @param {Object} params.user - The user who answered the question
 * @param {Object} params.question - The question that was answered
 * @param {Object} params.assessment - The assessment containing the question
 * @param {*} params.userAnswer - The user's answer
 * @param {boolean|*} params.correct - Whether the answer was correct
 * @returns {Promise<Object>} The saved xAPI statement
 */
const sendAnsweredStatement = async ({ user, question, assessment, userAnswer, correct }) => {
  try {
    // Create actor object (the user)
    const actor = {
      name: `${user.firstName} ${user.lastName}`,
      mbox: `mailto:${user.email}`,
      objectType: 'Agent'
    };

    // Create verb object (answered)
    const verb = {
      id: 'http://adlnet.gov/expapi/verbs/answered',
      display: {
        'en-US': 'answered'
      }
    };

    // Create object (the question)
    const object = {
      id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/questions/${question._id}`,
      definition: {
        name: { 'en-US': question.questionText },
        description: { 'en-US': `Question in ${assessment.title}` },
        type: 'http://adlnet.gov/expapi/activities/question'
      },
      objectType: 'Activity'
    };

    // Create result object
    const result = {
      success: correct === true,
      completion: true,
      response: typeof userAnswer === 'object' ? JSON.stringify(userAnswer) : String(userAnswer)
    };

    // Create context object
    const context = {
      contextActivities: {
        parent: [{
          id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/assessments/${assessment._id}`,
          definition: {
            name: { 'en-US': assessment.title },
            type: 'http://adlnet.gov/expapi/activities/assessment'
          }
        }],
        grouping: [{
          id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/courses/${assessment.course}`,
          definition: {
            type: 'http://adlnet.gov/expapi/activities/course'
          }
        }]
      }
    };

    // Create and save the xAPI statement
    const statement = new XapiStatement({
      organizationId: user.organization,
      userId: user._id,
      courseId: assessment.course,
      lessonId: assessment.lesson,
      actor,
      verb,
      object,
      result,
      context
    });

    return await statement.save();
  } catch (error) {
    console.error('Error creating answered xAPI statement:', error);
    // Don't throw error to prevent disrupting the main flow
    return null;
  }
};

/**
 * Send an xAPI statement for a completed assessment
 * @param {Object} params - Parameters for the statement
 * @param {Object} params.user - The user who completed the assessment
 * @param {Object} params.assessment - The completed assessment
 * @param {number} params.score - The score achieved
 * @param {number} params.total - The total possible score
 * @param {boolean} params.success - Whether the assessment was passed
 * @returns {Promise<Object>} The saved xAPI statement
 */
const sendCompletedStatement = async ({ user, assessment, score, total, success }) => {
  try {
    // Create actor object (the user)
    const actor = {
      name: `${user.firstName} ${user.lastName}`,
      mbox: `mailto:${user.email}`,
      objectType: 'Agent'
    };

    // Create verb object (completed)
    const verb = {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: {
        'en-US': 'completed'
      }
    };

    // Create object (the assessment)
    const object = {
      id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/assessments/${assessment._id}`,
      definition: {
        name: { 'en-US': assessment.title },
        description: { 'en-US': assessment.description || 'Assessment' },
        type: 'http://adlnet.gov/expapi/activities/assessment'
      },
      objectType: 'Activity'
    };

    // Create result object
    const result = {
      score: {
        scaled: total > 0 ? score / total : 0,
        raw: score,
        min: 0,
        max: total
      },
      success,
      completion: true
    };

    // Create context object
    const context = {
      contextActivities: {
        parent: [{
          id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/lessons/${assessment.lesson}`,
          definition: {
            type: 'http://adlnet.gov/expapi/activities/lesson'
          }
        }],
        grouping: [{
          id: `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/courses/${assessment.course}`,
          definition: {
            type: 'http://adlnet.gov/expapi/activities/course'
          }
        }]
      }
    };

    // Create and save the xAPI statement
    const statement = new XapiStatement({
      organizationId: user.organization,
      userId: user._id,
      courseId: assessment.course,
      lessonId: assessment.lesson,
      actor,
      verb,
      object,
      result,
      context
    });

    return await statement.save();
  } catch (error) {
    console.error('Error creating completed xAPI statement:', error);
    // Don't throw error to prevent disrupting the main flow
    return null;
  }
};

module.exports = {
  sendAnsweredStatement,
  sendCompletedStatement
}; 