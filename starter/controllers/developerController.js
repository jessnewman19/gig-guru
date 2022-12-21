const Developer = require('../models/developerModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//Create top 5 least expensive developers route
exports.aliasTopDevelopers = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,hourlyRate';
  req.query.fields = 'name,hourlyRate,ratingsAverage,summary,experienceLevel';
  next();
};

//ROUTE HANDLERS

exports.getAllDevelopers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Developer.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const developers = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: developers.length,
    data: {
      developers: developers,
    },
  });
});

exports.getDeveloper = catchAsync(async (req, res, next) => {
  const developer = await Developer.findById(req.params.id);
  //findById is shorthand for: Developer.findOne({_id: req.params.id})

  if (!developer) {
    return next(new AppError('No developer found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      developer,
    },
  });
});

exports.createDeveloper = catchAsync(async (req, res, next) => {
  const newDeveloper = await Developer.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      developer: newDeveloper,
    },
  });
});

exports.updateDeveloper = catchAsync(async (req, res, next) => {
  const updatedDeveloper = await Developer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedDeveloper) {
    return next(new AppError('No developer found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      developer: updatedDeveloper,
    },
  });
});

exports.deleteDeveloper = catchAsync(async (req, res, next) => {
  const deletedDeveloper = await Developer.findByIdAndDelete(req.params.id);
  if (!deletedDeveloper) {
    return next(new AppError('No developer found with that id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getDeveloperStats = catchAsync(async (req, res, next) => {
  const stats = await Developer.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$experienceLevel' },
        numDevelopers: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$hourlyRate' },
        minPrice: { $min: '$hourlyRate' },
        maxPrice: { $max: '$hourlyRate' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'NOVICE' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Developer.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numDevelopersStarts: { $sum: 1 },
        developers: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numDeveloperStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
