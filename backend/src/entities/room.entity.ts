import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Player } from './player.entity';
import { Card } from './card.entity';

export enum RoomStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5, unique: true })
  @Index()
  joinCode: string;

  @Column({ type: 'varchar', length: 255, default: 'Untitled Room' })
  title: string;

  @Column({ type: 'uuid', nullable: true })
  creatorId: string | null;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.LOBBY,
  })
  status: RoomStatus;

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Column('text', { array: true, default: [] })
  optionsPool: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastActivity: Date;

  @OneToMany(() => Player, (player) => player.room, { cascade: true })
  players: Player[];

  @OneToMany(() => Card, (card) => card.room, { cascade: true })
  cards: Card[];
}
