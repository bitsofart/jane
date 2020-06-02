import moment from 'moment'
import { getGhClient } from './gh'
import { owner, repo, config } from './config'
import { getContestPeriod } from './contest'
import { pullRequetsAssigned, pullRequestClosedDueToChanges } from './content'
import { PullRequestWebhookActions, GithubFile } from './types'
import { getReactions } from './reactions'
import { deployPullRequestPreview } from './deploy'

async function verifyFiles(prNumber: number): Promise<[boolean, GithubFile[]]> {
  const gh = getGhClient()
  const { data: files } = await gh.pulls.listFiles({ owner, repo, pull_number: prNumber })
  const { ALLOWED_FILES: allowedFiles } = config
  return [
    files.reduce((cssOnly, { filename }) => {
      return cssOnly && allowedFiles.includes(filename)
    }, true),
    files,
  ]
}

async function invalidatePullRequest(prNumber: number) {
  const gh = getGhClient()
  gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequestClosedDueToChanges })
}

async function verifyAndDeploy(pullRequetsNumber: number, action: PullRequestWebhookActions): Promise<void> {
  if (!['opened', 'edited', 'synchronize'].includes(action)) {
    throw new Error(`Not supported webhook action: ${action}`)
  }

  const reactions = await getReactions(pullRequetsNumber)
  if (action === 'synchronize' && reactions.length) {
    return await invalidatePullRequest(pullRequetsNumber)
  }
  const [areFilesValid, files] = await verifyFiles(pullRequetsNumber)
  if (areFilesValid) {
    await assingPullRequestToCurrentWeek(pullRequetsNumber)
    await deployPullRequestPreview(pullRequetsNumber, files)
  }
}

async function assingPullRequestToCurrentWeek(prNumber: number): Promise<void> {
  const gh = getGhClient()
  const { PULL_REQUEST_LABEL: prLabel } = config
  const contestPeriod = getContestPeriod(moment())
  await gh.issues.addLabels({ owner, repo, issue_number: prNumber, labels: [contestPeriod.fullLabel, prLabel] })
  await gh.issues.addAssignees({ owner, repo, issue_number: prNumber, assignees: ['janethebot'] })
  await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequetsAssigned })
}

export type PullRequestHandlers = {
  verifyAndDeploy: (pullRequetsNumber: number, action: PullRequestWebhookActions) => Promise<void>
}

export const pullRequests: PullRequestHandlers = {
  verifyAndDeploy,
}
