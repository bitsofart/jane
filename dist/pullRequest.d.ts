import moment from 'moment';
import Webhooks from '@octokit/webhooks';
import { PullRequestWebhookActions } from './types';
export declare type PullRequestHandlers = {
    verifyAndDeploy: (pullRequetsNumber: number, action: PullRequestWebhookActions, payload: Webhooks.WebhookPayloadPullRequest) => Promise<void>;
    selectWinner: (date: moment.Moment) => Promise<void>;
};
export declare const pullRequests: PullRequestHandlers;
