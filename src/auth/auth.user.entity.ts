import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  password: string;
}
