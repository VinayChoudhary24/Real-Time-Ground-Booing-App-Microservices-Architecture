import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  getInternalUserDetailsRepo,
  getUserDetailsRepo,
  updateUserDetailsRepo,
} from '../repository/user.repository';

export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return next(new ErrorHandler(400, 'User ID is required'));
    }
    const result = await getUserDetailsRepo(userId);
    if (!result) {
      return next(new ErrorHandler(401, 'User not found'));
    }
    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const updateData = req.body;

    if (!userId) {
      return next(new ErrorHandler(400, 'User ID is required'));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }
    const result = await updateUserDetailsRepo(userId, updateData);
    if (!result) {
      return next(new ErrorHandler(401, 'User not found'));
    }
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(new ErrorHandler(400, 'User ID is required'));
    }
    const result = await getInternalUserDetailsRepo(userId);
    if (!result) {
      return next(new ErrorHandler(404, 'User not found'));
    }
    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};
