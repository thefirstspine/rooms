/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn, BeforeUpdate, BeforeInsert } from 'typeorm';

@Entity()
export class Message {

  @PrimaryGeneratedColumn()
  message_id: number;

  @Column({type: 'numeric'})
  room_id: number;

  @Column({type: 'numeric'})
  user: number;

  @Column({length: 250})
  sender: string;

  @Column({type: 'text'})
  message: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

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
  exportPublicAttributes(): IPublicMessage {
    return {
      sender: this.sender,
      message: this.message,
      timestamp: this.created_at.getTime(),
    };
  }

}

/**
 * Public entity representing a room entity. Only THAT entity can travel across the network.
 */
export interface IPublicMessage {
  sender: string;
  message: string;
  timestamp: number;
}
