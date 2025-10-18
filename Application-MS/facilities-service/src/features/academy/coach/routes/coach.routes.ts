import express from 'express';
import {
  createNewCoach,
  deleteCoach,
  getAllCoach,
  getCoach,
  updateCoach,
} from '../controllers/coach.controller';

const router = express.Router();

// POST Routes
// Creates Coach
router.route('/api/coach').post(createNewCoach);

// GET Routes
// Get a coach
router.route('/api/coach/:coachId').get(getCoach);
// Get All coaches
router.route('/api/coach').get(getAllCoach);

// PUT Routes
// Update coach
router.route('/api/coach/:coachId').put(updateCoach);

// DELETE Routes
// (Soft Delete)
router.route('/api/coach/:coachId').delete(deleteCoach);

export default router;
