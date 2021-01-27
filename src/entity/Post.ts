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
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostLikes } from './Likes';
import { User } from './User';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ length: 120 })
  content!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imagePath?: string;

  @Column()
  creatorId: number;

  @Field(() => Int)
  numberOfLikes: number;

  @Field()
  hasUserLiked: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(() => [PostLikes])
  @OneToMany(() => PostLikes, (like) => like.post)
  postLikes: PostLikes[];

  @Field(() => String)
  @CreateDateColumn({ precision: 3 })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ precision: 3 })
  updatedAt: Date;
}
