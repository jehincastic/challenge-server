import DataLoader from 'dataloader';
import { In } from 'typeorm';

import { PostLikes } from '../entity/Likes';

// eslint-disable-next-line no-unused-vars
type BatchUserLiked = (key: readonly {
  postId: number;
  userId: number;
}[]) => Promise<boolean[]>;

const batchUserLiked: BatchUserLiked = async (key) => {
  const info = [...key];
  const liked = await PostLikes.find({
    where: {
      postId: In(info.map((val) => val.postId)),
      userId: key[0].userId,
    },
  });
  const likesMap: { [key: string]: PostLikes } = {};
  liked.forEach((likes) => {
    likesMap[likes.postId] = likes;
  });
  return key.map((data) => (!!likesMap[data.postId]));
};

export const userPostLikedLoader = () => new DataLoader<{
  postId: number;
  userId: number;
}, boolean>(batchUserLiked);
