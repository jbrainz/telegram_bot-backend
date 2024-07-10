import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BotUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: string;

  @Column()
  fullName: string;

  @Column({ nullable: true, default: false })
  isAdmin: boolean;
}
