import moment from 'moment'
import Webhooks from '@octokit/webhooks'
import { getGhClient } from './gh'
import { owner, repo, config } from './config'
import { getContestPeriod } from './contest'
import { previewDeployed, pullRequetsAssigned, pullRequestClosedDueToChanges } from './content'
import { PullRequestWebhookActions, GithubContentFile, GithubFile } from './types'
import { getReactions } from './reactions'
import { deployPullRequestPreview } from './deploy'

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

async function getIndexHtml(): Promise<GithubContentFile> {
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

export type PullRequestHandlers = {
  verifyAndDeploy: (
    pullRequetsNumber: number,
    action: PullRequestWebhookActions,
    payload: Webhooks.WebhookPayloadPullRequest,
  ) => Promise<void>
}

export const pullRequests: PullRequestHandlers = {
  verifyAndDeploy,
}
