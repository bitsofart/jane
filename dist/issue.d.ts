import moment from 'moment';
import { Issue, IssueWebhookPayload, IssueWebhookActions, ContestPeriod } from './types';
export declare function getIssues(labelName: string, issueFilter: (issue: Issue) => boolean): Promise<Issue[]>;
export declare function getMostVoted(issues: Issue[]): Promise<Issue | null>;
export declare function closeIssuesForPeriod(period: ContestPeriod, issueFilter: (issue: Issue) => boolean, comment: string): Promise<void>;
export declare type IssuesHandlers = {
    verify: (issueNumber: number, action: IssueWebhookActions, payload: IssueWebhookPayload) => Promise<void>;
    selectWinner: (date: moment.Moment) => Promise<void>;
};
export declare const issues: IssuesHandlers;
