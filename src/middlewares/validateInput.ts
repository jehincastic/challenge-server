import { MiddlewareFn } from 'type-graphql';

import { validatePassword, validateEmail } from '../utils/validators';
import { MyContext } from '../types';

const validateInput: MiddlewareFn<MyContext> = async ({ args }, next) => {
  const isPasswordValid = validatePassword(args.input.password);
  const isEmailValid = validateEmail(args.input.email);
  if (isPasswordValid && isEmailValid) {
    return next();
  }
  if (!isEmailValid) {
    return {
      error: 'Invalid Email Address',
    };
  }
  return {
    error: 'Password must be atleast 6 characters',
  };
};

export default validateInput;
