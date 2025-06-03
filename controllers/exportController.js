
const path = require('path');
const Course = require('../models/Course');
const { buildXapiZip } = require('../utils/xapiZipBuilder');

exports.exportCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, tenant: req.tenant })
      .populate('lessons topics assessments');
    if (!course) return res.sendStatus(404);

    const zipPath = await buildXapiZip(course);
    res.download(zipPath, path.basename(zipPath));
  } catch (err) { next(err); }
};
