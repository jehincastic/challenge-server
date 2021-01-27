import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import argon2 from 'argon2';

import {
  LoginInput,
  MyContext,
  RegisterInput,
  UserResponse,
} from '../types';
import { User } from '../entity/User';
import validateInput from '../middlewares/validateInput';
import { COOKIE_NAME } from '../constants';

@Resolver(() => User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(
     @Ctx() { req }: MyContext,
  ) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  @UseMiddleware(validateInput)
  async register(
    @Arg('input') input: RegisterInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    try {
      const {
        name,
        email,
        dob,
        password,
      } = input;
      const hashedPassword = await argon2.hash(password);
      const newUser = {
        name,
        email: email.toLowerCase(),
        dob,
        password: hashedPassword,
      };
      const user = await User.create({
        ...newUser,
      }).save();
      req.session.userId = user.id;
      return {
        user,
      };
    } catch (err) {
      if (err.code === '23505') {
        if (err.detail && err.detail.includes('email')) {
          return {
            error: 'Email Already taken.',
          };
        }
        return {
          error: 'Username Already taken.',
        };
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return {
        error: 'Server Error',
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const {
      email,
      password,
    } = input;
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (user) {
      const isPasswordValid = await argon2.verify(user.password, password);
      if (isPasswordValid) {
        req.session.userId = user.id;
        return {
          user,
        };
      }
      return {
        error: 'Invalid Email/Password.',
      };
    }
    return {
      error: 'Invalid Email/Password.',
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext,
  ) {
    return new Promise((resolve) => {
      req.session.destroy((err: any) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      });
    });
  }
}
