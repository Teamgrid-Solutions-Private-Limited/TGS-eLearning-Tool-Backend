const CourseStructure = require('../../models/course-structure.model');
const mongoose = require('mongoose');
const {
  checkCourseExists,
  getNextSequence,
  validateSequenceUniqueness,
  reorderSequences,
  buildQuery
} = require('./course-structure.helper');

// Create a new course structure
exports.createCourseStructure = async (req, res) => {
  try {
    // Check if course exists
    await checkCourseExists(req.body.courseId);

    // If sequence is not provided, get the next available sequence
    if (!req.body.sequence) {
      req.body.sequence = await getNextSequence(req.body.courseId);
    } else {
      // Validate sequence uniqueness
      await validateSequenceUniqueness(req.body.courseId, req.body.sequence);
    }

    const courseStructure = new CourseStructure(req.body);
    const savedStructure = await courseStructure.save();
    
    // Populate course details
    await savedStructure.populate('courseId', 'title');
    res.status(201).json(savedStructure);
  } catch (error) {
    if (error.message === 'Course not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all course structures with pagination and filters
exports.getCourseStructures = async (req, res) => {
  try {
    const { courseId, page = 1, limit = 10, sort, includeLessons } = req.query;
    const filters = courseId ? { courseId } : {};
    
    // Build query with filters and options
    const query = buildQuery(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort || { sequence: 1 },
      populate: [
        { path: 'courseId', select: 'title' },
        includeLessons === 'true' ? { path: 'lessons' } : null
      ].filter(Boolean)
    });

    // Execute query and get total count
    const [structures, total] = await Promise.all([
      query.exec(),
      CourseStructure.countDocuments(filters)
    ]);

    res.json({
      structures,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single course structure by ID
exports.getCourseStructureById = async (req, res) => {
  try {
    const query = CourseStructure.findById(req.params.id)
      .populate('courseId', 'title');
    
    // Optionally populate lessons
    if (req.query.includeLessons === 'true') {
      query.populate('lessons');
    }
    
    const structure = await query;
    
    if (!structure) {
      return res.status(404).json({ message: 'Course structure not found' });
    }
    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a course structure
exports.updateCourseStructure = async (req, res) => {
  try {
    const structure = await CourseStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Course structure not found' });
    }

    // If sequence is being updated, validate uniqueness
    if (req.body.sequence && req.body.sequence !== structure.sequence) {
      await validateSequenceUniqueness(structure.courseId, req.body.sequence, structure._id);
    }

    // Update and populate
    const updatedStructure = await CourseStructure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('courseId', 'title');

    res.json(updatedStructure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a course structure
exports.deleteCourseStructure = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const structure = await CourseStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ message: 'Course structure not found' });
    }

    // Delete the structure
    await structure.deleteOne({ session });

    // Reorder remaining sequences
    await reorderSequences(structure.courseId, structure.sequence);

    await session.commitTransaction();
    res.json({ message: 'Course structure deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Bulk update sequence numbers
exports.updateSequences = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get all structures to update
    const structureIds = req.body.updates.map(u => u.id);
    const structures = await CourseStructure.find({ _id: { $in: structureIds } });

    // Verify all structures exist and belong to the same course
    if (structures.length !== req.body.updates.length) {
      return res.status(404).json({ message: 'One or more structures not found' });
    }

    const courseId = structures[0].courseId;
    if (!structures.every(s => s.courseId.equals(courseId))) {
      return res.status(400).json({ message: 'All structures must belong to the same course' });
    }

    // Verify sequence numbers are unique
    const sequences = req.body.updates.map(u => u.sequence);
    if (new Set(sequences).size !== sequences.length) {
      return res.status(400).json({ message: 'Sequence numbers must be unique' });
    }

    // Update sequences
    const results = await Promise.all(
      req.body.updates.map(update =>
        CourseStructure.findByIdAndUpdate(
          update.id,
          { sequence: update.sequence },
          { new: true, session }
        ).populate('courseId', 'title')
      )
    );

    await session.commitTransaction();
    res.json(results);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
}; 