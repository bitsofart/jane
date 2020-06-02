import { issues, IssuesHandlers } from './issue'
import { pullRequests, PullRequestHandlers } from './pullRequest'

type Handlers = { issues: IssuesHandlers; pullRequests: PullRequestHandlers }

export const janeHandles: Handlers = {
  issues,
  pullRequests,
}
