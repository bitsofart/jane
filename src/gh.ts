import { Octokit } from '@octokit/rest'

let client: Octokit | undefined

export function init(): Octokit {
  client = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })
  return client
}

export function getGhClient(): Octokit {
  if (!client) {
    return init()
  }
  return client
}
