import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { isAuth } from '../middlewares/isAuthenticated';
import { Post } from '../entity/Post';
import {
  GetPostInput,
  GetPostResponse,
  MyContext,
  PostResponse,
  Upload,
} from '../types';
import fileUpload from '../utils/fileUpload';

@InputType()
class CreatePostInput {
  @Field()
  content: string;

  @Field(() => GraphQLUpload, { nullable: true })
  picture?: Upload
}

@Resolver(() => Post)
export class PostResolver {
  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async addNewPost(
    @Arg('input') input: CreatePostInput,
    @Ctx() { req }: MyContext,
  ): Promise<PostResponse> {
    try {
      const { userId } = req.session;
      const {
        picture,
        content,
      } = input;
      let imagePath = null;
      const key = uuidv4();
      if (picture) {
        const imgInfo = await picture;
        const fileExtension = 'jpg';
        imagePath = path.resolve(__dirname, '..', '..', 'public', 'images', `${key}.${fileExtension}`);
        await fileUpload(imgInfo, imagePath);
      }
      const post = await Post.create({
        content,
        imagePath: imagePath ? `/images/${key}.jpg` : undefined,
        creatorId: userId,
      }).save();
      return {
        post,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return {
        error: 'Server Error PLease Try Again',
      };
    }
  }

  @Query(() => GetPostResponse)
  @UseMiddleware(isAuth)
  async getPosts(
    @Arg('input') input: GetPostInput,
  ): Promise<GetPostResponse> {
    const {
      page,
      limit,
    } = input;
    const [posts, count] = await Post.findAndCount({
      order: {
        id: 'DESC',
      },
      skip: page * limit,
      take: limit + 1,
    });
    return {
      count,
      posts: posts.slice(0, limit),
      hasNext: posts.length === (limit + 1),
    };
  }

  @FieldResolver()
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext,
  ) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver()
  async hasUserLiked(
    @Root() post: Post,
    @Ctx() { req, userLikedLoader }: MyContext,
  ) {
    return userLikedLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
  }

  @FieldResolver()
  async numberOfLikes(
    @Root() post: Post,
    @Ctx() { numberOfLikedLoader }: MyContext,
  ) {
    return numberOfLikedLoader.load(post.id);
  }
}
