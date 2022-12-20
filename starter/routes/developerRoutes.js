const express = require('express');
const {
  getAllDevelopers,
  createDeveloper,
  getDeveloper,
  updateDeveloper,
  deleteDeveloper,
  aliasTopDevelopers,
  getDeveloperStats,
  getMonthlyPlan,
} = require('../controllers/developerController');

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopDevelopers, getAllDevelopers);
router.route('/tour-stats').get(getDeveloperStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(getAllDevelopers).post(createDeveloper);

router
  .route('/:id')
  .get(getDeveloper)
  .patch(updateDeveloper)
  .delete(deleteDeveloper);

module.exports = router;
