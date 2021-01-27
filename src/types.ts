import {
  InputType,
  Field,
  ObjectType,
  Int,
} from 'type-graphql';
import { Stream } from 'stream';
import DataLoader from 'dataloader';

import { Post } from './entity/Post';
import { User } from './entity/User';

/* eslint-disable no-undef */
export type MyContext = {
  req: Request & { session: { userId: number, destroy: any } };
  res: Response & { clearCookie: any };
  userLoader: DataLoader<number, User, number>;
  userLikedLoader: DataLoader<{
    postId: number;
    userId: number;
  }, boolean, {
    postId: number;
    userId: number;
  }>;
  numberOfLikedLoader: DataLoader<number, number, number>;
};

@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;

  @Field()
  dob!: Date;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class GetPostInput {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class UserResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class PostResponse {
  @Field(() => String, { nullable: true })
  error?: string

  @Field(() => Post, { nullable: true })
  post?: Post
}

@ObjectType()
export class GetPostResponse {
  @Field(() => String, { nullable: true })
  error?: string

  @Field(() => [Post], { nullable: true })
  posts?: Post[]

  @Field()
  hasNext: boolean;

  @Field(() => Int, { nullable: true })
  count?: number;
}

export type Upload = {
  createReadStream: () => Stream;
  filename: string;
  mimetype: string;
  encoding: string;
}
