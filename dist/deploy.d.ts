import { PRAuthor, GithubFile } from './types';
export declare function deployPullRequestPreview(prNumber: number, files: Array<GithubFile>, author: PRAuthor): Promise<string>;
