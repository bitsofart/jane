export const issueAssigned = `**Your issue is participating in this weeks choice of content.**

For more information on how content selection works, please check this document: [Content Selection](https://github.com/bitsofart/contest/wiki)
`

export const issueSelected = (commitSha: string): string => `**Your issue was selected for next week's contest**

Your issue was selected and it will be the base for next week's contest!

_Commit_: #${commitSha}.

Your github profile will also be linked from the contest homepage once a CSS winner is selected.

For more information on how the contest works, please check this document: [Content Selection](https://github.com/bitsofart/contest/wiki)`

export const issueClosedDueToEdition = `**Your issue is being automatically closed**

This Content Suggestion issue is being closed because its content was edited.

For more information on how the contest works, please check this document: [Content Selection](https://github.com/bitsofart/contest/wiki)`

export const pullRequetsAssigned = `**Your pull request is participating on this week's CSS Contest**

Thanks for sending us your submission. It will be deployed soon, so others can preview the result of your work.

For more information on how the contest works, please check this document: [Submission](https://github.com/bitsofart/contest/wiki).`

export const pullRequestClosedDueToChanges = `**Your Pull Request is being automatically closed**

Pull requests can't be changed after there were already reactions to it.

For more information on how the contest works, please check this document: [Submission](https://github.com/bitsofart/contest/wiki).  `

export const previewDeployed = (deployUrl: string): string => `**Your submission is being deployed**

Your submission is being deployed and should be available soon here: [https://${deployUrl}](https://${deployUrl}).
`
