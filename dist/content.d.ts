export declare const issueAssigned = "**Your issue is participating in this weeks choice of content.**\n\nFor more information on how content selection works, please check this document: [Content Selection](https://github.com/bitsofart/contest/wiki)\n";
export declare const issueSelected: (commitSha: string, commitUrl: string) => string;
export declare const issueClosedDueToEdition = "**Your issue is being automatically closed**\n\nThis Content Suggestion issue is being closed because its content was edited.\n\nFor more information on how the contest works, please check this document: [Content Selection](https://github.com/bitsofart/contest/wiki)";
export declare const closingIssueComment = "**We're closing this issue**\n\nThank you very much for participating. We hope to keep seeing you around! :wave:.\n";
export declare const closingPRComment = "**We're closing this PR**\n\nThank you very much for participating. We hope to keep seeing you around! :wave:.\n";
export declare const pullRequetsAssigned = "**Your pull request is participating on this week's CSS Contest**\n\nThanks for sending us your submission. It will be deployed soon, so others can preview the result of your work.\n\nFor more information on how the contest works, please check this document: [Submission](https://github.com/bitsofart/contest/wiki).";
export declare const pullRequestClosedDueToChanges = "**Your Pull Request is being automatically closed**\n\nPull requests can't be changed after there were already reactions to it.\n\nFor more information on how the contest works, please check this document: [Submission](https://github.com/bitsofart/contest/wiki).";
export declare const previewDeployed: (deployUrl: string) => string;
export declare const invalidPullRequest: (error: string) => string;
export declare const pullRequestWinnerCommit: (weekLabel: string) => string;
export declare const pullRequetsWinnerComment = ":tada: This PR is this weeks constest winner! :tada:\n\nIt will be merged and deployed to [csscontest.com](https://csscontest.com) soon.\n\nThank you very much for your participation!\n";
export declare const pullRequestInvalidAcknowledge = "Notice: this Pull Request is not a valid contest entry.\n\nFor more information on how submissions work, check this document: [CSS Submission wiki](https://github.com/bitsofart/contest/wiki/CSS-Submission)\n";