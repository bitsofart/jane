export const config = {
  ALLOWED_FILES: ['styles.css'],
  ISSUE_CYCLE: '1w',
  ISSUE_LABEL: 'Next content',
  PULL_REQUEST_LABEL: 'Entry submission',
  OWNER: 'bitsofart',
  POSITIVE_REACTIONS: ['THUMBS_UP', 'LAUGH', 'HOORAY', 'HEART', 'ROCKET'],
  REPOSITORY: 'contest',
  WINNER_LABEL: 'Selected',
  HTML_TEMPLATE_PATH: 'template.hbs',
}

export const repo = 'contest' || process.env.JANE_REPO_NAME
export const owner = 'bitsofart' || process.env.JANE_REPO_OWNER
