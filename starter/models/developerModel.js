const mongoose = require('mongoose');
const slugify = require('slugify');

const developerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Developer must have a name'],
      unique: true,
      maxLength: [
        40,
        'A Developer name must have less or equal than 40 characters',
      ],
      minLength: [5, 'A Developer name must have more than 10 characters'],
    },
    slug: String,
    yearsOfExperience: {
      type: Number,
      required: [true, 'A Developer must have years of experience listed'],
    },
    maxTeamSize: {
      type: Number,
      required: [true, 'Developer must have a team size'],
    },
    experienceLevel: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: {
        values: ['Novice', 'Proficient', 'Expert'],
        message: 'Experience level is either: Novice, Proficient, or Expert',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'A Developer must have an hourly rate'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document created, not update
          return val < this.price; //Ex. price discount = 100 and price = 200 || price discount = 250 and price = 200
        },
        message: 'Discount price {VALUE} should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Developer must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      required: [true, 'A developer must have a profile photo'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Cannot use arrow function when want to reference 'this'
developerSchema.virtual('durationWeeks').get(function () {
  return this.yearsOfExperience / 7;
});

//DOCUMENT MIDDLEWARE: runs before .save command and .create command
//'this'points to current document object
developerSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE
//'this'points to current query object
developerSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// developerSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   console.log(docs);
//   next();
// });

//AGGREGATION MIDDLEWARE
//'this'points to aggregate object
developerSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Developer = mongoose.model('Developer', developerSchema);

module.exports = Developer;
