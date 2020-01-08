/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn, Unique, BeforeUpdate, BeforeInsert, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class RoomSender {

  @PrimaryGeneratedColumn()
  room_sender_id: number;

  @Column()
  user: number;

  @Column({length: 250})
  display_name: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @ManyToOne(type => Room, room => room.roomSenders)
  room_id: number;

  @BeforeUpdate()
  beforeUpdate() {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Export public entity. Only THAT entity can travel across the network.
   */
  exportPublicAttributes(): IPublicRoomSender {
    return {
      user: this.user,
      displayName: this.display_name,
      timestamp: this.created_at.getTime(),
    };
  }

}

/**
 * Public entity representing a room entity. Only THAT entity can travel across the network.
 */
export interface IPublicRoomSender {
  user: number;
  displayName: string;
  timestamp: number;
}
