import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Card } from './card.entity';

@Entity('card_spaces')
@Unique(['cardId', 'position'])
export class CardSpace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  cardId: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'varchar' })
  optionText: string;

  @Column({ type: 'boolean', default: false })
  isFreeSpace: boolean;

  @Column({ type: 'boolean', default: false })
  isMarked: boolean;

  @ManyToOne(() => Card, (card) => card.spaces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  card: Card;
}
