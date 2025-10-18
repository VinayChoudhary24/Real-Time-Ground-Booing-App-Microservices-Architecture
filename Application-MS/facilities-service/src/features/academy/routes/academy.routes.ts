import express from 'express';
import {
  createNewAcademy,
  deleteAcademy,
  getAcademy,
  getAllAcademy,
  updateAcademy,
} from '../controllers/academy.controller';

const router = express.Router();

// POST Routes
// Creates Academy
router.route('/api/academy').post(createNewAcademy);

// GET Routes
// Get a academy
router.route('/api/academy/:academyId').get(getAcademy);
// Get All academy
router.route('/api/academy').get(getAllAcademy);

// PUT Routes
// Update academy
router.route('/api/academy/:academyId').put(updateAcademy);

// DELETE Routes
// (Soft Delete)
router.route('/api/academy/:academyId').delete(deleteAcademy);

export default router;
