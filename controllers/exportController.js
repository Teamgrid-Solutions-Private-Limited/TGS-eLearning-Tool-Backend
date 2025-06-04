const path          = require('path');
const Course        = require('../models/course.model');
const { buildXapiZip } = require('../utils/xapiZipBuilder');

exports.exportCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, tenant: req.tenant })
                               .populate('lessons topics assessments');
    if (!course) return res.sendStatus(404);

    const zipPath = await buildXapiZip(course);
    
    // Set appropriate headers for ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(zipPath)}`);
    
    res.download(zipPath, path.basename(zipPath));
  } catch (err) { next(err); }
};
