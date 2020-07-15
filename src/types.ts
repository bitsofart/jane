export type IssueWebhookActions =
  | 'opened'
  | 'edited'
  | 'deleted'
  | 'pinned'
  | 'unpinned'
  | 'closed'
  | 'reopened'
  | 'assigned'
  | 'unassigned'
  | 'labeled'
  | 'unlabeled'
  | 'locked'
  | 'unlocked'
  | 'transferred'
  | 'milestoned'
  | 'demilestoned'

export type PullRequestWebhookActions =
  | 'opened'
  | 'closed'
  | 'edited'
  | 'assigned'
  | 'unassigned'
  | 'review_requested'
  | 'review_request_removed'
  | 'ready_for_review'
  | 'labeled'
  | 'unlabeled'
  | 'synchronize'
  | 'locked'
  | 'unlocked'
  | 'reopened'

export type ContestPeriod = {
  week: number
  year: number
  fullLabel: string
}

export type Repository = {
  id: string
  name: string
  owner: {
    login: string
    url: string
  }
}

export type Issue = {
  id: number
  node_id: string
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  number: number
  state: string
  title: string
  body: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  labels: {
    id: number
    node_id: string
    url: string
    name: string
    description: string
    color: string
    default: boolean
  }[]
  assignee: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  assignees: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }[]
  milestone: {
    url: string
    html_url: string
    labels_url: string
    id: number
    node_id: string
    number: number
    state: string
    title: string
    description: string
    creator: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      gravatar_id: string
      url: string
      html_url: string
      followers_url: string
      following_url: string
      gists_url: string
      starred_url: string
      subscriptions_url: string
      organizations_url: string
      repos_url: string
      events_url: string
      received_events_url: string
      type: string
      site_admin: boolean
    }
    open_issues: number
    closed_issues: number
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
  }
  locked: boolean
  active_lock_reason: string
  comments: number
  pull_request: {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
  }
  closed_at: string
  created_at: string
  updated_at: string
}

export type IssueWebhookPayload = {
  action: string
  issue: Issue
  changes: {
    title?: {
      from: string
    }
    body?: {
      from: string
    }
  }
}

export type Reaction = {
  id: number
  node_id: string
  user: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  content: string
  created_at: string
}

export type Label = {
  id: number
  color: string
  name: string
  description: string
  default: boolean
}

export type GithubFile = {
  sha: string
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch: string
}

export type GithubContentFile = {
  type: string
  encoding: string
  size: number
  name: string
  path: string
  content: string
  sha: string
  url: string
  git_url: string
  html_url: string
  download_url: string
  _links: {
    git: string
    self: string
    html: string
  }
}
