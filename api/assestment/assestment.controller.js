const Assessment = require('../../models/assessment.model');
const mongoose = require('mongoose');

class AssessmentController {
  // Create a new assessment
  async createAssessment(req, res) {
    try {
      const assessment = new Assessment(req.body);
      await assessment.save();
      res.status(201).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all assessments
  async getAllAssessments(req, res) {
    try {
      const assessments = await Assessment.find()
        .populate('lesson', 'title')
        .populate('course', 'title')
        .populate('courseStructure', 'title')
        .populate('questions.question');
      
      res.status(200).json({
        success: true,
        count: assessments.length,
        data: assessments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get assessment by ID
  async getAssessmentById(req, res) {
    try {
      const assessment = await Assessment.findById(req.params.id)
        .populate('lesson', 'title')
        .populate('course', 'title')
        .populate('courseStructure', 'title')
        .populate('questions.question');

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update assessment
  async updateAssessment(req, res) {
    try {
      const assessment = await Assessment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete assessment
  async deleteAssessment(req, res) {
    try {
      const assessment = await Assessment.findByIdAndDelete(req.params.id);

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get assessments by course
  async getAssessmentsByCourse(req, res) {
    try {
      const assessments = await Assessment.find({ course: req.params.courseId })
        .populate('lesson', 'title')
        .populate('course', 'title')
        .populate('courseStructure', 'title');

      res.status(200).json({
        success: true,
        count: assessments.length,
        data: assessments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get assessments by lesson
  async getAssessmentsByLesson(req, res) {
    try {
      const assessments = await Assessment.find({ lesson: req.params.lessonId })
        .populate('lesson', 'title')
        .populate('course', 'title')
        .populate('courseStructure', 'title');

      res.status(200).json({
        success: true,
        count: assessments.length,
        data: assessments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // Get assessments by course structure
  async getAssessmentsByCourseStructure(req, res) {
    try {
      const assessments = await Assessment.find({ courseStructure: req.params.courseStructureId })
        .populate('lesson', 'title')
        .populate('course', 'title')
        .populate('courseStructure', 'title');

      res.status(200).json({
        success: true,
        count: assessments.length,
        data: assessments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Add question to assessment
  async addQuestionToAssessment(req, res) {
    try {
      const assessment = await Assessment.findById(req.params.id);
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }
      
      assessment.questions.push({
        question: req.body.questionId,
        weight: req.body.weight || 1
      });
      
      await assessment.save();
      
      const updatedAssessment = await Assessment.findById(req.params.id)
        .populate('questions.question');
      
      res.status(200).json({
        success: true,
        data: updatedAssessment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // Remove question from assessment
  async removeQuestionFromAssessment(req, res) {
    try {
      const assessment = await Assessment.findById(req.params.id);
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }
      
      assessment.questions = assessment.questions.filter(
        q => q._id.toString() !== req.params.questionItemId
      );
      
      await assessment.save();
      
      res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Submit assessment answers
  async submitAssessment(req, res) {
    try {
      const assessment = await Assessment.findById(req.params.id)
        .populate('questions.question');
      
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found'
        });
      }

      // Here you would implement the logic to:
      // 1. Validate answers
      // 2. Calculate score
      // 3. Store submission
      // 4. Return results based on showFeedback setting

      res.status(200).json({
        success: true,
        message: 'Assessment submitted successfully',
        // Add more response data as needed
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AssessmentController(); 