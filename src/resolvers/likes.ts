import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Resolver,
  UseMiddleware,
} from 'type-graphql';

import { isAuth } from '../middlewares/isAuthenticated';
import { PostLikes } from '../entity/Likes';
import { MyContext } from '../types';

@Resolver(() => PostLikes)
export class PostLikeResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async likePost(
    @Arg('postId', () => Int) postId: number,
    @Ctx() { req }: MyContext,
  ): Promise<boolean> {
    try {
      const { userId } = req.session;
      const likedPost = await PostLikes.findOne({
        postId,
        userId,
      });
      if (!likedPost) {
        await PostLikes.create({
          postId,
          userId,
        }).save();
        return true;
      }
      await likedPost?.remove();
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw new Error('Unable to like post');
    }
  }
}
