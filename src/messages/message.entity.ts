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
      user: this.user,
      message: this.message,
      timestamp: this.created_at.getTime(),
    };
  }

}

/**
 * Public entity representing a room entity. Only THAT entity can travel across the network.
 */
export interface IPublicMessage {
  message: string;
  user: number;
  timestamp: number;
}
