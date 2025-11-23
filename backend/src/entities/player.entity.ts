import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { Room } from './room.entity';
import { Card } from './card.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  roomId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  @Index()
  sessionToken: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @UpdateDateColumn()
  lastSeen: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Room, (room) => room.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToOne(() => Card, (card) => card.player, { cascade: true })
  card?: Card;
}
