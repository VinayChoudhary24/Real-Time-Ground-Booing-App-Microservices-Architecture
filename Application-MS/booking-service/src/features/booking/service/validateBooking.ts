import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

export const validateBookingInput = (body: any) => {
  const requiredFields: { field: string; path: string[] }[] = [
    // { field: 'merchantUserId', path: [] },
    // { field: 'locationId', path: [] },
    { field: 'facilityId', path: [] },

    { field: 'slots', path: [] },
    { field: 'subTotalAmount', path: [] },
    { field: 'totalAmount', path: [] },
  ];

  for (const { field, path } of requiredFields) {
    let value = body;
    for (const key of path) {
      value = value?.[key];
    }

    if (
      path.length === 0 ? !body?.[field] : value === undefined || value === '' || value === null
    ) {
      throw new ErrorHandler(400, `Please provide '${field}'`);
    }
  }

  if (!Array.isArray(body.slots) || body.slots.length === 0) {
    throw new ErrorHandler(400, 'Please provide at least one slot');
  }

  if (typeof body.subTotalAmount !== 'number' || body.subTotalAmount < 0) {
    throw new ErrorHandler(400, 'Invalid subTotalAmount');
  }

  if (typeof body.totalAmount !== 'number' || body.totalAmount < 0) {
    throw new ErrorHandler(400, 'Invalid totalAmount');
  }
};
