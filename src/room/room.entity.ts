/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn, Unique, BeforeUpdate, BeforeInsert, OneToMany } from 'typeorm';
import { RoomSender, IPublicRoomSender } from './room-sender.entity';

@Entity()
@Unique('name_subject', ['name', 'subject'])
export class Room {

  @PrimaryGeneratedColumn()
  room_id: number;

  @Column({length: 250})
  name: string;

  @Column({length: 250})
  subject: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @OneToMany(type => RoomSender, roomSender => roomSender.room_id, {cascade: true})
  roomSenders: RoomSender[];

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
  exportPublicAttributes(): IPublicRoom {
    return {
      name: this.name,
      subject: this.subject,
      timestamp: this.created_at.getTime(),
      senders: this.roomSenders.map((s) => s.exportPublicAttributes()),
    };
  }

}

/**
 * Public entity representing a room entity. Only THAT entity can travel across the network.
 */
export interface IPublicRoom {
  name: string;
  subject: string;
  timestamp: number;
  senders: IPublicRoomSender[];
}
