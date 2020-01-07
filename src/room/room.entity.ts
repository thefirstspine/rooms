/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {

  @PrimaryGeneratedColumn()
  room_id: number;

  @Column({length: 250})
  name: string;

  @Column({length: 250})
  subject: string;

  /**
   * Export public entity. Only THAT entity can travel across the network.
   */
  exportPublicAttributes(): IPublicRoom {
    return {
      room_id: this.room_id,
      name: this.name,
      subject: this.subject,
    };
  }

}

/**
 * Public entity representing a room entity. Only THAT entity can travel across the network.
 */
export interface IPublicRoom {
  room_id: number;
  name: string;
  subject: string;
}
