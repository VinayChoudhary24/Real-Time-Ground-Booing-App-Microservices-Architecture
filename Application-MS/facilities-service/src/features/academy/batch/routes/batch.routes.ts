import express from 'express';
import {
  createNewBatch,
  deleteBatch,
  getAllBatch,
  getBatch,
  updateBatch,
} from '../controllers/batch.controller';

const router = express.Router();

// POST Routes
// Creates Batch
router.route('/api/batch').post(createNewBatch);

// GET Routes
// Get a batch
router.route('/api/batch/:batchId').get(getBatch);
// Get All batches
router.route('/api/batch').get(getAllBatch);

// PUT Routes
// Update batch
router.route('/api/batch/:batchId').put(updateBatch);

// DELETE Routes
// (Soft Delete)
router.route('/api/batch/:batchId').delete(deleteBatch);

export default router;
