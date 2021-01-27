import DataLoader from 'dataloader';

import { User } from '../entity/User';

// eslint-disable-next-line no-unused-vars
type BatchUser = (ids: readonly number[]) => Promise<User[]>;

const batchUser: BatchUser = async (ids) => {
  const userIds = [...ids];
  const user = await User.findByIds(userIds);
  const userMap: { [key: string]: User } = {};
  user.forEach((u) => {
    userMap[u.id] = u;
  });
  return ids.map((id) => userMap[id]);
};

export const postcreatorLoader = () => new DataLoader<number, User>(batchUser);
