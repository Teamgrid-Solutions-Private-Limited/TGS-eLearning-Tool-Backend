const Lesson = require('../../models/lesson.model');
const mongoose = require('mongoose');

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    const savedLesson = await lesson.save();
    res.status(201).json(savedLesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all lessons (with optional course filter)
exports.getLessons = async (req, res) => {
  try {
    const filter = req.query.course ? { course: req.query.course } : {};
    const lessons = await Lesson.find(filter)
      .populate('course', 'title')
      .sort({ sequence: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single lesson by ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 