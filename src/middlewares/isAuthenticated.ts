import { MiddlewareFn } from 'type-graphql';

import { MyContext } from '../types';

export const isAuth: MiddlewareFn<MyContext> = async ({ context, info }, next) => {
  if (!context.req.session.userId) {
    if (info.fieldName === 'getPosts') {
      return {
        error: 'Please Login to Continue',
        hasNext: false,
      };
    }
    if (info.fieldName === 'addNewPost') {
      return {
        error: 'Please Login to Continue',
      };
    }
    throw new Error('Please Login To Continue');
  }

  return next();
};
