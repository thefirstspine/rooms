import { Injectable } from '@nestjs/common';

/**
 * Main subjects services. Subjects are the top-levels items in the rooms architecture,
 * allowing only one user to create/drop/alter rooms inside a subject.
 */
@Injectable()
export class SubjectsService {

  /**
   * Get the available subjects. They are stored in the environment config.
   */
  getSubjects(): ISubject[] {
    const config: string = process.env.SUBJECTS;
    return config.split(',').map((s: string) => {
      const subject: string[] = s.split(':');
      return {
        name: subject[0],
      };
    });
  }

  /**
   * Get one subject.
   * @param name
   */
  getSubject(name: string): ISubject|undefined {
    return this.getSubjects().find((s: ISubject) => s.name === name);
  }

}

/**
 * Interface representing a subject.Subjects are the top-levels items in the rooms architecture,
 * allowing only one user to create/drop/alter rooms inside a subject.
 */
export interface ISubject {
  name: string;
}
