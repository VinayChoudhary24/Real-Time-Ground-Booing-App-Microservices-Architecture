import express from 'express';
import {
  createNewPlayer,
  deletePlayer,
  getAllPlayer,
  getPlayer,
  updatePlayer,
} from '../controllers/player.controller';

const router = express.Router();

// POST Routes
// Creates Player
router.route('/api/player').post(createNewPlayer);

// GET Routes
// Get a player
router.route('/api/player/:playerId').get(getPlayer);
// Get All players
router.route('/api/player').get(getAllPlayer);

// PUT Routes
// Update player
router.route('/api/player/:playerId').put(updatePlayer);

// DELETE Routes
// (Soft Delete)
router.route('/api/player/:playerId').delete(deletePlayer);

export default router;
