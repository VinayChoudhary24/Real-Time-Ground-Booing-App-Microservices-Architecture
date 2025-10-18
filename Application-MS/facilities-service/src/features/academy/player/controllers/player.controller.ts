import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';
import {
  createNewPlayerRepo,
  deletePlayerRepo,
  getAllPlayerCountRepo,
  getAllPlayerRepo,
  getPlayerRepo,
  updatePlayerRepo,
} from '../repository/player.repository';

export const createNewPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const { firstName, lastName, phoneCode, phone, sport, gender, locationId } = req.body;
    if (
      !firstName ||
      !lastName ||
      !phoneCode ||
      !phone ||
      !sport ||
      !gender ||
      !merchantUserId ||
      !locationId
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const result: any = await createNewPlayerRepo(req.body, merchantUserId);
    if (!result) {
      return next(new ErrorHandler(400, 'Unable to create player. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Player created successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { playerId } = req.params;

    if (!merchantUserId || !playerId) {
      return next(new ErrorHandler(400, 'Merchant ID and Player ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getPlayerRepo(merchantUserId, locationId, playerId);

    if (!result) {
      return next(new ErrorHandler(404, 'Player not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string)?.trim() || '';
    const status = parseInt(req.query.status as string) || 1;
    const locationId = (req.query?.locationId as string) || '';

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant ID is required'));
    }

    const result = await getAllPlayerRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllPlayerCountRepo({ merchantUserId, locationId, status });

    if (!result || !count) {
      return next(new ErrorHandler(404, 'Academy not found or inactive'));
    }

    res.status(200).json({
      success: true,
      total: count,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { playerId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !playerId) {
      return next(new ErrorHandler(400, 'Merchant ID and Player ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updatePlayerRepo(merchantUserId, playerId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Player not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Player updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { playerId } = req.params;

    if (!merchantUserId || !playerId) {
      return next(new ErrorHandler(400, 'Merchant ID and Player ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deletePlayerRepo(merchantUserId, locationId, playerId);

    if (!result) {
      return next(new ErrorHandler(404, 'Player not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Player deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
