import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';
import {
  createNewCoachRepo,
  deleteCoachRepo,
  getAllCoachCountRepo,
  getAllCoachRepo,
  getCoachRepo,
  updateCoachRepo,
} from '../repository/coach.repository';

export const createNewCoach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const { firstName, lastName, phoneCode, phone, email, sport, gender, locationId } = req.body;
    if (
      !firstName ||
      !lastName ||
      !phoneCode ||
      !phone ||
      !email ||
      !sport ||
      !gender ||
      !merchantUserId ||
      !locationId
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const result: any = await createNewCoachRepo(req.body, merchantUserId);
    if (!result) {
      return next(new ErrorHandler(400, 'Unable to create coach. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Coach created successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getCoach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { coachId } = req.params;

    if (!merchantUserId || !coachId) {
      return next(new ErrorHandler(400, 'Merchant ID and Coach ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getCoachRepo(merchantUserId, locationId, coachId);

    if (!result) {
      return next(new ErrorHandler(404, 'Coach not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoach = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await getAllCoachRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllCoachCountRepo({ merchantUserId, locationId, status });

    if (!result || !count) {
      return next(new ErrorHandler(404, 'Coach not found or inactive'));
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

export const updateCoach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { coachId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !coachId) {
      return next(new ErrorHandler(400, 'Merchant ID and Coach ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateCoachRepo(merchantUserId, coachId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Coach not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Coach updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { coachId } = req.params;

    if (!merchantUserId || !coachId) {
      return next(new ErrorHandler(400, 'Merchant ID and Coach ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deleteCoachRepo(merchantUserId, locationId, coachId);

    if (!result) {
      return next(new ErrorHandler(404, 'Coach not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Coach deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
