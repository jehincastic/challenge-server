import {
  Field,
  ObjectType,
} from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { User } from './User';
import { Post } from './Post';

@ObjectType()
@Entity()
@Unique(['userId', 'postId'])
export class PostLikes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  postId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userLikes)
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.postLikes)
  post!: Post;
}
