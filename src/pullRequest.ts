import moment from 'moment'
import Webhooks from '@octokit/webhooks'
import { getGhClient } from './gh'
import { owner, repo, config } from './config'
import { getContestPeriod } from './contest'
import {
  closingPRComment,
  previewDeployed,
  pullRequetsAssigned,
  pullRequestClosedDueToChanges,
  pullRequestWinnerCommit,
  pullRequetsWinnerComment,
} from './content'
import { PullRequestWebhookActions, GithubFileWithContent, GithubFile, Issue, ContestPeriod } from './types'
import { getReactions } from './reactions'
import { deployPullRequestPreview } from './deploy'
import { getIssues, getMostVoted, closeIssuesForPeriod } from './issue'

async function verifyFiles(prNumber: number): Promise<[boolean, GithubFile[]]> {
  const gh = getGhClient()
  const { data: prFiles } = await gh.pulls.listFiles({ owner, repo, pull_number: prNumber })
  const { ALLOWED_FILES: allowedFiles } = config
  const files: GithubFile[] = prFiles.map((file) => ({ ...file, githubFileType: 'pr' }))
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

async function getIndexHtml(): Promise<GithubFileWithContent> {
  const gh = getGhClient()
  const { data: fileContent } = await gh.repos.getContent({ owner, repo, path: 'index.html' })
  return { ...fileContent, githubFileType: 'content' }
}

async function verifyAndDeploy(
  prNumber: number,
  action: PullRequestWebhookActions,
  payload: Webhooks.WebhookPayloadPullRequest,
): Promise<void> {
  if (!['opened', 'edited', 'synchronize'].includes(action)) {
    throw new Error(`Not supported webhook action: ${action}`)
  }

  if (!payload) {
    throw new Error('Missing webhook payload.')
  }

  const reactions = await getReactions(prNumber)
  if (action === 'synchronize' && reactions.length) {
    return await invalidatePullRequest(prNumber)
  }
  const [areFilesValid, files] = await verifyFiles(prNumber)
  if (areFilesValid) {
    await assingPullRequestToCurrentWeek(prNumber)
    const htmlFile = await getIndexHtml()
    const deployUrl = await deployPullRequestPreview(prNumber, [htmlFile, ...files], {
      url: payload.pull_request.user.html_url,
      handle: payload.pull_request.user.login,
    })
    const gh = getGhClient()
    await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: previewDeployed(deployUrl) })
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

function excludeIssues(issue: Issue): boolean {
  return !!issue.pull_request
}

async function makeWinner(prNumber: number, period: ContestPeriod): Promise<void> {
  const gh = getGhClient()
  const { PULL_REQUEST_WINNER: winningPrLabel } = config
  await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequetsWinnerComment })
  await gh.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    commit_title: pullRequestWinnerCommit(period.fullLabel),
  })
  await gh.issues.addLabels({ owner, repo, issue_number: prNumber, labels: [winningPrLabel] })
}

async function selectWinner(date = moment()) {
  const period = getContestPeriod(date)
  try {
    const prs = await getIssues(period.fullLabel, excludeIssues)
    const mostVotedPr = await getMostVoted(prs)
    await makeWinner(mostVotedPr.number, period)
    await closeIssuesForPeriod(period, excludeIssues, closingPRComment)
  } catch (error) {
    console.error(`Something happened and I can not select a winner for ${period.fullLabel}.`, { error })
  }
}

export type PullRequestHandlers = {
  verifyAndDeploy: (
    pullRequetsNumber: number,
    action: PullRequestWebhookActions,
    payload: Webhooks.WebhookPayloadPullRequest,
  ) => Promise<void>
  selectWinner: (date: moment.Moment) => Promise<void>
}

export const pullRequests: PullRequestHandlers = {
  verifyAndDeploy,
  selectWinner,
}
