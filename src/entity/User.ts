import {
  Field,
  Int,
  ObjectType,
} from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostLikes } from './Likes';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column({ precision: 3 })
  dob: Date;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @Field(() => [PostLikes])
  @OneToMany(() => PostLikes, (like) => like.user)
  userLikes: PostLikes[];

  @Field(() => String)
  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date;
}
