const { AppError } = require('../../middleware/errorHandler');
const Organization = require('../../models/organization.model');
const asyncHandler = require('../../middleware/asyncHandler');

// @desc    Create new organization
// @route   POST /api/v1/organizations
// @access  Private/Admin
exports.createOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    data: organization
  });
});

// @desc    Get all organizations
// @route   GET /api/v1/organizations
// @access  Private/Admin
exports.getOrganizations = asyncHandler(async (req, res, next) => {
  // Add query parameters for filtering
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  excludeFields.forEach(el => delete queryObj[el]);

  // Create query
  let query = Organization.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Organization.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const organizations = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: organizations.length,
    pagination,
    data: organizations
  });
});

// @desc    Get single organization
// @route   GET /api/v1/organizations/:id
// @access  Private
exports.getOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id).populate('courses');

  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }

  res.status(200).json({
    success: true,
    data: organization
  });
});

// @desc    Update organization
// @route   PUT /api/v1/organizations/:id
// @access  Private/Admin
exports.updateOrganization = asyncHandler(async (req, res, next) => {
  let organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }

  organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Organization updated successfully',
    data: organization
  });
});

// @desc    Delete organization
// @route   DELETE /api/v1/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }

  await organization.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Organization deleted successfully',
    data: {}
  });
});

// @desc    Get organization statistics
// @route   GET /api/v1/organizations/stats
// @access  Private/Admin
exports.getOrganizationStats = asyncHandler(async (req, res, next) => {
  const stats = await Organization.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'organization',
        as: 'users'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'organization',
        as: 'courses'
      }
    },
    {
      $project: {
        name: 1,
        totalUsers: { $size: '$users' },
        totalCourses: { $size: '$courses' },
        isActive: 1,
        createdAt: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
}); 