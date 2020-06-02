import { config, repo, owner } from './config'
import { getGhClient } from './gh'
import { Reaction } from './types'

export function getPosititiveReactionsCount(reactions: Reaction[]): number {
  return reactions.reduce((total, { content }) => {
    if (config.POSITIVE_REACTIONS.includes(content)) {
      return total + 1
    }
    return total
  }, 0)
}

export async function getReactions(issueNumber: number): Promise<Reaction[]> {
  const gh = getGhClient()
  const { data: reactions } = await gh.reactions.listForIssue({ repo, owner, issue_number: issueNumber })
  return reactions
}
