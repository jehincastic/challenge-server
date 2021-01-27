import DataLoader from 'dataloader';
import { getConnection } from 'typeorm';

import { PostLikes } from '../entity/Likes';

// eslint-disable-next-line no-unused-vars
type BatchNumberOfLikes = (ids: readonly number[]) => Promise<number[]>;

type countType = {
  count: string;
  postId: number;
};

const batchNumberOfLikes: BatchNumberOfLikes = async (ids) => {
  const postIds = [...ids];
  const liked: countType[] = await getConnection()
    .createQueryBuilder()
    .select('COUNT(*), pl."postId"')
    .from(PostLikes, 'pl')
    .where('pl."postId" in (:...ids)', { ids: postIds })
    .groupBy('pl."postId"')
    .execute();
  const likesMap: { [key: string]: number } = {};
  liked.forEach((likes) => {
    likesMap[likes.postId] = Number(likes.count);
  });
  return ids.map((id) => likesMap[id] || 0);
};

export const numberOfLikedLoader = () => new DataLoader<number, number>(batchNumberOfLikes);
