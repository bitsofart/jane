import axios from 'axios'
import moment from 'moment'
import Webhooks from '@octokit/webhooks'
import { getGhClient } from './gh'
import { owner, repo, productionRepo, config } from './config'
import { getContestPeriod } from './contest'
import {
  closingPRComment,
  previewDeployed,
  pullRequetsAssigned,
  pullRequestClosedDueToChanges,
  pullRequestWinnerCommit,
  pullRequetsWinnerComment,
  invalidPullRequest,
  pullRequestInvalidAcknowledge,
} from './content'
import { PullRequestWebhookActions, GithubFileWithContent, GithubFile, Issue, ContestPeriod } from './types'
import { getReactions } from './reactions'
import { deployPullRequestPreview } from './deploy'
import { getIssues, getMostVoted, closeIssuesForPeriod } from './issue'
import { prepareContentFile } from './template'

async function getFileRawContent(rawContentUrl: string): Promise<string> {
  const { data } = await axios.get(rawContentUrl)
  return data
}

async function verifyFiles(prNumber: number): Promise<[boolean, GithubFile[], string | undefined]> {
  const gh = getGhClient()
  const { data: prFiles } = await gh.pulls.listFiles({ owner, repo, pull_number: prNumber })

  const allowedFiles = ['styles.css', 'index.html']
  const files: GithubFile[] = prFiles.map((file) => ({ ...file, githubFileType: 'pr' }))
  const areChangedFilesAllowed =
    files.length === 2 &&
    files.reduce((areAllowed, { filename }) => {
      return areAllowed && allowedFiles.includes(filename)
    }, true)
  const nextHtml = await getNextIndexHtml()
  const prHtml = files.filter(({ filename }) => filename === 'index.html')[0]
  if (!prHtml) {
    gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequestInvalidAcknowledge })
    throw new Error('Missing HTML content change.')
  }
  const [nextHtmlContent, prHtmlContent] = [
    await getFileRawContent(nextHtml.download_url),
    await getFileRawContent(prHtml.raw_url),
  ]
  const isHtmlContentCorrect = nextHtmlContent === prHtmlContent
  const error = !areChangedFilesAllowed
    ? 'PR contains invalid files'
    : !isHtmlContentCorrect
    ? 'PR contains invalid HTML content'
    : undefined
  return [areChangedFilesAllowed && isHtmlContentCorrect, files, error]
}

async function invalidatePullRequest(prNumber: number) {
  const gh = getGhClient()
  await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequestClosedDueToChanges })
}

async function getNextIndexHtml(): Promise<GithubFileWithContent> {
  const gh = getGhClient()
  const { data: fileContent } = await gh.repos.getContent({ owner, repo, path: 'next.html' })
  return { ...fileContent, githubFileType: 'content' }
}

async function verifyAndDeploy(
  prNumber: number,
  action: PullRequestWebhookActions,
  payload: Webhooks.WebhookPayloadPullRequest,
): Promise<void> {
  try {
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
    const [areFilesValid, files, error] = await verifyFiles(prNumber)
    const gh = getGhClient()
    if (!areFilesValid) {
      await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: invalidPullRequest(error) })
      return
    }
    await assingPullRequestToCurrentWeek(prNumber)
    const deployUrl = await deployPullRequestPreview(prNumber, files, {
      url: payload.pull_request.user.html_url,
      handle: payload.pull_request.user.login,
    })
    await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: previewDeployed(deployUrl) })
  } catch (error) {
    // Add some sort of notification
    console.error({ error })
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

async function updateProduction(
  contestPeriod: ContestPeriod,
  styleCreatorLogin: string,
  styleCreatorUrl: string,
): Promise<void> {
  const gh = getGhClient()
  const ref = 'heads/master'
  const indexFileContent = await prepareContentFile({
    style_creator_url: styleCreatorUrl,
    style_creator_handle: styleCreatorLogin,
  })
  const { data: cssFile } = await gh.repos.getContent({ owner, repo, path: 'styles.css' })
  const {
    data: {
      object: { sha: latestCommit },
    },
  } = await gh.git.getRef({ owner, repo: productionRepo, ref })
  const {
    data: { sha: baseTree },
  } = await gh.git.getTree({ owner, repo: productionRepo, tree_sha: latestCommit })
  const {
    data: { sha: newTreeSha },
  } = await gh.git.createTree({
    owner,
    repo: productionRepo,
    tree: [
      {
        path: 'index.html',
        mode: '100644',
        type: 'blob',
        content: indexFileContent,
      },
      {
        path: 'styles.css',
        mode: '100644',
        type: 'blob',
        content: Buffer.from(cssFile.content, 'base64').toString('utf8'),
      },
    ],
    base_tree: baseTree,
  })
  const commitMessage = `Content for week ${contestPeriod.fullLabel}`
  const {
    data: { sha: newCommitSha },
  } = await gh.git.createCommit({
    owner,
    repo: productionRepo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [latestCommit],
  })
  await gh.git.updateRef({ owner, repo: productionRepo, ref, sha: newCommitSha })
}

async function makeWinner(prNumber: number, period: ContestPeriod): Promise<[string, string]> {
  const gh = getGhClient()
  const { PULL_REQUEST_WINNER: winningPrLabel } = config
  const {
    data: {
      user: { login, html_url: loginUrl },
    },
  } = await gh.pulls.get({ owner, repo, pull_number: prNumber })
  await gh.issues.addLabels({ owner, repo, issue_number: prNumber, labels: [winningPrLabel] })
  await gh.issues.createComment({ owner, repo, issue_number: prNumber, body: pullRequetsWinnerComment })
  await gh.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
    commit_title: pullRequestWinnerCommit(period.fullLabel),
  })
  return [login, loginUrl]
}

async function selectWinner(date = moment()) {
  const period = getContestPeriod(date)
  try {
    const prs = await getIssues(period.fullLabel, excludeIssues)
    const mostVotedPr = await getMostVoted(prs)
    const [winnerLogin, winnerUrl] = await makeWinner(mostVotedPr.number, period)
    await closeIssuesForPeriod(period, excludeIssues, closingPRComment)
    await updateProduction(period, winnerUrl, winnerLogin)
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
