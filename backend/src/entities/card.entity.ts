import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Player } from './player.entity';
import { Room } from './room.entity';
import { CardSpace } from './card-space.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  playerId: string;

  @Column({ type: 'uuid' })
  @Index()
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Player, (player) => player.card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @ManyToOne(() => Room, (room) => room.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToMany(() => CardSpace, (space) => space.card, { cascade: true })
  spaces: CardSpace[];
}
