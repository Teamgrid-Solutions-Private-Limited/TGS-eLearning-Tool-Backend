const Progress = require('../../models/progress.model');
const Course = require('../../models/course.model');
const Lesson = require('../../models/lesson.model');
const Topic = require('../../models/topic.model');
const Assessment = require('../../models/assessment.model');

class ProgressController {
   
  async updateProgress(req, res) {
    try {
      const { userId, courseId, lessonId, topicId, assessmentId, score } = req.body;

      // Find existing progress or create new one
      let progress = await Progress.findOne({
        user: userId,
        course: courseId
      });

      if (!progress) {
        progress = new Progress({
          user: userId,
          course: courseId,
          status: 'inProgress'
        });
      }

      // Update last accessed time
      progress.lastAccessedAt = new Date();

      // Update completion status based on provided data
      if (lessonId && !progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      if (topicId && !progress.completedTopics.includes(topicId)) {
        progress.completedTopics.push(topicId);
      }

      if (assessmentId && !progress.completedAssessments.includes(assessmentId)) {
        progress.completedAssessments.push(assessmentId);
        if (score) {
          progress.score = score;
        }
      }

      // Calculate completion percentage
      const course = await Course.findById(courseId);
      if (course) {
        const totalLessons = await Lesson.countDocuments({ course: courseId });
        const totalTopics = await Topic.countDocuments({ course: courseId });
        const totalAssessments = await Assessment.countDocuments({ course: courseId });

        const totalItems = totalLessons + totalTopics + totalAssessments;
        const completedItems = progress.completedLessons.length + 
                             progress.completedTopics.length + 
                             progress.completedAssessments.length;

        progress.completionPercentage = Math.round((completedItems / totalItems) * 100);
      }

      // Update status based on completion percentage
      if (progress.completionPercentage === 100) {
        progress.status = 'completed';
        progress.completedAt = new Date();
      } else if (progress.completionPercentage > 0) {
        progress.status = 'inProgress';
      }

      await progress.save();

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

   
  async getCourseProgress(req, res) {
    try {
      const { userId, courseId } = req.params;

      const progress = await Progress.findOne({
        user: userId,
        course: courseId
      }).populate('completedLessons completedTopics completedAssessments');

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        });
      }

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  
  async getUserProgress(req, res) {
    try {
      const { userId } = req.params;

      const progress = await Progress.find({ user: userId })
        .populate('course')
        .populate('completedLessons')
        .populate('completedTopics')
        .populate('completedAssessments');

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  
  async resetProgress(req, res) {
    try {
      const { userId, courseId } = req.params;

      const progress = await Progress.findOne({
        user: userId,
        course: courseId
      });

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: 'Progress not found'
        });
      }

      // Reset all progress fields
      progress.completionPercentage = 0;
      progress.completedLessons = [];
      progress.completedTopics = [];
      progress.completedAssessments = [];
      progress.score = null;
      progress.status = 'notStarted';
      progress.completedAt = null;

      await progress.save();

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProgressController(); 