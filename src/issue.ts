import moment from 'moment'
import { config, owner, repo } from './config'
import { getContestPeriod } from './contest'
import { getGhClient } from './gh'
import { prepareContentFile } from './template'
import { closingIssueComment, issueAssigned, issueSelected, issueClosedDueToEdition } from './content'
import { Issue, IssueWebhookPayload, IssueWebhookActions, ContestPeriod, Label } from './types'
import { getPosititiveReactionsCount, getReactions } from './reactions'

async function assignIssueForNextWeeksContest(issueNumber: number): Promise<void> {
  const gh = getGhClient()
  const contestPeriod = getContestPeriod(moment().add(1, 'w'))
  await gh.issues.addLabels({ owner, repo, issue_number: issueNumber, labels: [contestPeriod.fullLabel] })
  await gh.issues.addAssignees({ owner, repo, issue_number: issueNumber, assignees: ['janethebot'] })
  await gh.issues.createComment({ owner, repo, issue_number: issueNumber, body: issueAssigned })
}

function excludePullRequest(issue: Issue): boolean {
  return !issue.pull_request
}

function containsLabel(name: string, labels: Label[]): boolean {
  const result = labels.reduce((contains, label) => {
    if (contains) return contains
    return label.name === name
  }, false)
  return result
}

async function invalidateIssue(issueNumber: number, payload: IssueWebhookPayload) {
  const original = payload?.changes?.body?.from
  const changedTo = payload?.issue?.body
  if (original && changedTo && original !== changedTo) {
    const gh = getGhClient()
    gh.issues.createComment({ owner, repo, issue_number: issueNumber, body: issueClosedDueToEdition })
    gh.issues.update({ owner, repo, issue_number: issueNumber, state: 'closed' })
  }
  return
}

async function verify(issueNumber: number, action: IssueWebhookActions, payload: IssueWebhookPayload): Promise<void> {
  try {
    const gh = getGhClient()
    const {
      data: { labels },
    } = await gh.issues.get({ owner, repo, issue_number: issueNumber })
    if (action === 'edited' && containsLabel(config.ISSUE_LABEL, labels)) {
      return await invalidateIssue(issueNumber, payload)
    }

    if (action === 'opened') {
      return await assignIssueForNextWeeksContest(issueNumber)
    }

    console.log(`Nothing to do in issue #${issueNumber}`)
  } catch (error) {
    console.error(`Sorry, but it wasn't possible to verify issue #${issueNumber} due to the following error:\n`, {
      error,
    })
  }
}

export async function getIssues(labelName: string, issueFilter: (issue: Issue) => boolean): Promise<Issue[]> {
  console.log(`Listing issues...`)
  const gh = getGhClient()
  const { data: issues } = await gh.issues.listForRepo({
    owner,
    repo,
    labels: labelName,
    sort: 'created',
    state: 'open',
  })
  return issues.filter(issueFilter)
}

export async function getMostVoted(issues: Issue[]): Promise<Issue | null> {
  console.log('Getting most voted.')
  const all = await Promise.all(
    issues.map(async (issue) => {
      const reactions = await getReactions(issue.number)
      return {
        issue,
        reactions,
      }
    }),
  )
  if (!all.length) {
    throw new Error("No issues listed. Can't select a winner")
  }

  return all.sort((issueA, issueB) => {
    const positiveA = getPosititiveReactionsCount(issueA.reactions)
    const positiveB = getPosititiveReactionsCount(issueB.reactions)
    return positiveA < positiveB ? -1 : positiveA > positiveB ? 1 : 0
  })[0]['issue']
}

async function commitWinningIssue(issue: Issue, contestPeriod: ContestPeriod): Promise<{ sha: string; url: string }> {
  const gh = getGhClient()
  const ref = 'heads/master'
  const {
    data: {
      object: { sha: latestCommit },
    },
  } = await gh.git.getRef({ owner, repo, ref })
  const {
    data: { sha: baseTree },
  } = await gh.git.getTree({ owner, repo, tree_sha: latestCommit })
  const filename = 'next.html'
  const content = await prepareContentFile({
    content: issue.body,
    content_creator_url: issue.user.html_url,
    content_creator_handle: issue.user.login,
  })
  const {
    data: { sha: newTreeSha },
  } = await gh.git.createTree({
    owner,
    repo,
    tree: [{ path: filename, mode: '100644', type: 'blob', content }],
    base_tree: baseTree,
  })
  const commitMessage = `Content for week ${contestPeriod.fullLabel}`
  const {
    data: { sha: newCommitSha },
  } = await gh.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [latestCommit],
  })
  await gh.git.updateRef({ owner, repo, ref, sha: newCommitSha })
  const commitUrl = `https://github.com/${owner}/${repo}/commit/${newCommitSha}`
  return { sha: newCommitSha, url: commitUrl }
}

async function markAsWinnerIssue(issue: Issue, period: ContestPeriod): Promise<Issue | null> {
  console.log(`I will make #${issue.number} the next contest content`)
  const winnerLabel = config.WINNER_LABEL
  const gh = getGhClient()
  if (!winnerLabel) {
    throw new Error('No label found.')
  }
  if (!issue) {
    throw new Error('No issue found.')
  }
  await gh.issues.addLabels({
    owner,
    repo,
    issue_number: issue.number,
    labels: [winnerLabel],
  })
  const { sha: commitSha, url: commitUrl } = await commitWinningIssue(issue, period)
  await gh.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: issueSelected(commitSha, commitUrl),
  })
  return issue
}

export async function closeIssuesForPeriod(
  period: ContestPeriod,
  issueFilter: (issue: Issue) => boolean,
  comment: string,
): Promise<void> {
  const gh = getGhClient()
  const { data: issues } = await gh.issues.listForRepo({ owner, repo, labels: period.fullLabel })
  await Promise.all(
    issues.filter(issueFilter).map(async (issue) => {
      await gh.issues.update({ owner, repo, issue_number: issue.number, state: 'closed' })
      await gh.issues.createComment({ owner, repo, issue_number: issue.number, body: comment })
    }),
  )
}

async function selectWinner(date: moment.Moment = moment()): Promise<void> {
  try {
    // For issues we always look one week ahead
    const period = getContestPeriod(date.add(1, 'w'))
    const issues = await getIssues(period.fullLabel, excludePullRequest)
    const mostVotedIssue = await getMostVoted(issues)
    Promise.all([
      markAsWinnerIssue(mostVotedIssue, period),
      closeIssuesForPeriod(period, excludePullRequest, closingIssueComment),
    ])
  } catch (error) {
    console.error('I am sorry but I was unable to select a winner due to the error bellow:\n', error)
  }
}

export type IssuesHandlers = {
  verify: (issueNumber: number, action: IssueWebhookActions, payload: IssueWebhookPayload) => Promise<void>
  selectWinner: (date: moment.Moment) => Promise<void>
}

export const issues: IssuesHandlers = {
  verify,
  selectWinner,
}
