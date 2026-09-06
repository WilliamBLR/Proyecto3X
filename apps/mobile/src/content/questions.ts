import rawQuestions from './questions.json';
import type { Question } from '../domain/model';

export const questions = rawQuestions as Question[];
export const questionById = new Map(questions.map((question) => [question.id, question]));
