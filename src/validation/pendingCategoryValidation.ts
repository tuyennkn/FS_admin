// PendingCategory validation functions
export const validateCreatePendingCategory = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.book_id || typeof data.book_id !== 'string') {
    errors.push('Book ID is required and must be a string');
  }

  if (!data.genre || typeof data.genre !== 'string' || data.genre.trim().length === 0) {
    errors.push('Genre is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateApprovePendingCategory = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.category_name || typeof data.category_name !== 'string') {
    errors.push('Category name is required and must be a string');
  } else if (data.category_name.trim().length < 2) {
    errors.push('Category name must be at least 2 characters');
  } else if (data.category_name.length > 100) {
    errors.push('Category name must be less than 100 characters');
  }

  if (data.category_description && typeof data.category_description === 'string' && data.category_description.length > 500) {
    errors.push('Category description must be less than 500 characters');
  }

  if (data.review_notes && typeof data.review_notes === 'string' && data.review_notes.length > 1000) {
    errors.push('Review notes must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRejectPendingCategory = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.review_notes || typeof data.review_notes !== 'string' || data.review_notes.trim().length === 0) {
    errors.push('Review notes are required when rejecting');
  } else if (data.review_notes.length > 1000) {
    errors.push('Review notes must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAssignPendingCategory = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.existing_category_id || typeof data.existing_category_id !== 'string') {
    errors.push('Category ID is required and must be a string');
  }

  if (data.review_notes && typeof data.review_notes === 'string' && data.review_notes.length > 1000) {
    errors.push('Review notes must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePendingCategoryFilters = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (data.status && !['pending', 'approved', 'rejected'].includes(data.status)) {
    errors.push('Status must be one of: pending, approved, rejected');
  }

  if (data.page && (typeof data.page !== 'number' || data.page < 1)) {
    errors.push('Page must be a number greater than 0');
  }

  if (data.limit && (typeof data.limit !== 'number' || data.limit < 1 || data.limit > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Type checking helpers
export const isPendingCategoryStatus = (status: string): status is 'pending' | 'approved' | 'rejected' => {
  return ['pending', 'approved', 'rejected'].includes(status);
};

export const sanitizePendingCategoryData = (data: any) => {
  return {
    book_id: typeof data.book_id === 'string' ? data.book_id.trim() : '',
    genre: typeof data.genre === 'string' ? data.genre.trim() : '',
  };
};

export const sanitizeApprovePendingCategoryData = (data: any) => {
  return {
    category_name: typeof data.category_name === 'string' ? data.category_name.trim() : '',
    category_description: typeof data.category_description === 'string' ? data.category_description.trim() : '',
    review_notes: typeof data.review_notes === 'string' ? data.review_notes.trim() : '',
  };
};