import { IssuesHandlers } from './issue';
import { PullRequestHandlers } from './pullRequest';
declare type Handlers = {
    issues: IssuesHandlers;
    pullRequests: PullRequestHandlers;
};
export declare const janeHandles: Handlers;
export {};
