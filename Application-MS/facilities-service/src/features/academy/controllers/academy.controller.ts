import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  createNewAcademyRepo,
  deleteAcademyRepo,
  getAcademyRepo,
  getAllAcademyCountRepo,
  getAllAcademyRepo,
  updateAcademyRepo,
} from '../repository/academy.repository';

export const createNewAcademy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const { name, sport, locationId, facilityId } = req.body;
    if (!name || !sport || !merchantUserId || !locationId || !facilityId) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const result: any = await createNewAcademyRepo(req.body, merchantUserId);
    if (!result) {
      return next(new ErrorHandler(400, 'Unable to create academy. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Academy created successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getAcademy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { academyId } = req.params;

    if (!merchantUserId || !academyId) {
      return next(new ErrorHandler(400, 'Merchant ID and Academy ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getAcademyRepo(merchantUserId, locationId, academyId);

    if (!result) {
      return next(new ErrorHandler(404, 'Academy not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAcademy = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await getAllAcademyRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllAcademyCountRepo({ merchantUserId, locationId, status });

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

export const updateAcademy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { academyId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !academyId) {
      return next(new ErrorHandler(400, 'Merchant ID and Academy ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateAcademyRepo(merchantUserId, academyId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Academy not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Academy updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { academyId } = req.params;

    if (!merchantUserId || !academyId) {
      return next(new ErrorHandler(400, 'Merchant ID and Academy ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deleteAcademyRepo(merchantUserId, locationId, academyId);

    if (!result) {
      return next(new ErrorHandler(404, 'Academy not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Academy deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
