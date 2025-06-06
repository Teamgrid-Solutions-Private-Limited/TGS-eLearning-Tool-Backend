const XapiStatement = require('../../models/xapi-statement.model');
const User = require('../../models/user.model');
 
class XapiStatementController {
  
  static createXapiStatement = async (req,res) => {
    try {
      const {organizationId, userId, courseId, lessonId, statement ,actor,verb,object,result,context}= req.body;

      const user = await User.findById(userId);

      if (!organizationId || !userId || !courseId || !lessonId || !statement)
      {
        return res.status(404).json({msg: "Fields are required"});
      }

      if (!user) {
        return res.status(404).json({msg: "User not found"});
      }
       
      const xapiStatement = new XapiStatement(
        {
          organizationId,
          userId,
          courseId,
          lessonId,
          actor,
          verb,
          object,
          result,
          context,
        }
      )
      const savedStatement = await xapiStatement.save();
      res.status(201).json({msg: "Xapi statement created successfully ",data:savedStatement})
      
    } catch (error) {
      res.status(500).json({msg: "Error creating xapi statement",error: error.message});
    }
  }

  static getAllXapiStatements = async (req, res) => {
    try {
      const { organizationId, userId, courseId, lessonId } = req.query;
      
      // Build filter object based on query parameters
      const filter = {};
      if (organizationId) filter.organizationId = organizationId;
      if (userId) filter.userId = userId;
      if (courseId) filter.courseId = courseId;
      if (lessonId) filter.lessonId = lessonId;

      const statements = await XapiStatement.find(filter)
        .sort({ timestamp: -1 })
        .populate('userId', 'firstName lastName email')
        .populate('courseId', 'title')
        .populate('lessonId', 'title');

      res.status(200).json({
        success: true,
        count: statements.length,
        data: statements
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error fetching xapi statements",
        error: error.message
      });
    }
  }

  static getXapiStatementById = async (req, res) => {
    try {
      const statement = await XapiStatement.findById(req.params.id)
        .populate('userId', 'firstName lastName email')
        .populate('courseId', 'title')
        .populate('lessonId', 'title');

      if (!statement) {
        return res.status(404).json({
          success: false,
          msg: "Xapi statement not found"
        });
      }

      res.status(200).json({
        success: true,
        data: statement
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error fetching xapi statement",
        error: error.message
      });
    }
  }

  static updateXapiStatement = async (req, res) => {
    try {
      const { actor, verb, object, result, context } = req.body;
      
      const statement = await XapiStatement.findById(req.params.id);
      
      if (!statement) {
        return res.status(404).json({
          success: false,
          msg: "Xapi statement not found"
        });
      }

      // Update only the fields that are provided
      if (actor) statement.actor = actor;
      if (verb) statement.verb = verb;
      if (object) statement.object = object;
      if (result) statement.result = result;
      if (context) statement.context = context;

      const updatedStatement = await statement.save();

      res.status(200).json({
        success: true,
        msg: "Xapi statement updated successfully",
        data: updatedStatement
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error updating xapi statement",
        error: error.message
      });
    }
  }

  static deleteXapiStatement = async (req, res) => {
    try {
      const statement = await XapiStatement.findById(req.params.id);
      
      if (!statement) {
        return res.status(404).json({
          success: false,
          msg: "Xapi statement not found"
        });
      }

      await statement.deleteOne();

      res.status(200).json({
        success: true,
        msg: "Xapi statement deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error deleting xapi statement",
        error: error.message
      });
    }
  }
}

module.exports = XapiStatementController;