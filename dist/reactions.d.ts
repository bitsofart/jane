import { Reaction } from './types';
export declare function getPosititiveReactionsCount(reactions: Reaction[]): number;
export declare function getReactions(issueNumber: number): Promise<Reaction[]>;
