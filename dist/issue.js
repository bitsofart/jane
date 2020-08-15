"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.issues = exports.closeIssuesForPeriod = exports.getMostVoted = exports.getIssues = void 0;
var moment_1 = __importDefault(require("moment"));
var config_1 = require("./config");
var contest_1 = require("./contest");
var gh_1 = require("./gh");
var template_1 = require("./template");
var content_1 = require("./content");
var reactions_1 = require("./reactions");
function assignIssueForNextWeeksContest(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, contestPeriod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    contestPeriod = contest_1.getContestPeriod(moment_1["default"]().add(1, 'w'));
                    return [4 /*yield*/, gh.issues.addLabels({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber, labels: [contestPeriod.fullLabel] })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, gh.issues.addAssignees({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber, assignees: ['janethebot'] })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber, body: content_1.issueAssigned })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function excludePullRequest(issue) {
    return !issue.pull_request;
}
function containsLabel(name, labels) {
    var result = labels.reduce(function (contains, label) {
        if (contains)
            return contains;
        return label.name === name;
    }, false);
    return result;
}
function invalidateIssue(issueNumber, payload) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var original, changedTo, gh;
        return __generator(this, function (_d) {
            original = (_b = (_a = payload === null || payload === void 0 ? void 0 : payload.changes) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.from;
            changedTo = (_c = payload === null || payload === void 0 ? void 0 : payload.issue) === null || _c === void 0 ? void 0 : _c.body;
            if (original && changedTo && original !== changedTo) {
                gh = gh_1.getGhClient();
                gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber, body: content_1.issueClosedDueToEdition });
                gh.issues.update({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber, state: 'closed' });
            }
            return [2 /*return*/];
        });
    });
}
function verify(issueNumber, action, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, labels, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.issues.get({ owner: config_1.owner, repo: config_1.repo, issue_number: issueNumber })];
                case 1:
                    labels = (_a.sent()).data.labels;
                    if (!(action === 'edited' && containsLabel(config_1.config.ISSUE_LABEL, labels))) return [3 /*break*/, 3];
                    return [4 /*yield*/, invalidateIssue(issueNumber, payload)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    if (!(action === 'opened')) return [3 /*break*/, 5];
                    return [4 /*yield*/, assignIssueForNextWeeksContest(issueNumber)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    console.log("Nothing to do in issue #" + issueNumber);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Sorry, but it wasn't possible to verify issue #" + issueNumber + " due to the following error:\n", {
                        error: error_1
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getIssues(labelName, issueFilter) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Listing issues...");
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.issues.listForRepo({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            labels: labelName,
                            sort: 'created',
                            state: 'open'
                        })];
                case 1:
                    issues = (_a.sent()).data;
                    return [2 /*return*/, issues.filter(issueFilter)];
            }
        });
    });
}
exports.getIssues = getIssues;
function getMostVoted(issues) {
    return __awaiter(this, void 0, void 0, function () {
        var all;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Getting most voted.');
                    return [4 /*yield*/, Promise.all(issues.map(function (issue) { return __awaiter(_this, void 0, void 0, function () {
                            var reactions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, reactions_1.getReactions(issue.number)];
                                    case 1:
                                        reactions = _a.sent();
                                        return [2 /*return*/, {
                                                issue: issue,
                                                reactions: reactions
                                            }];
                                }
                            });
                        }); }))];
                case 1:
                    all = _a.sent();
                    if (!all.length) {
                        throw new Error("No issues listed. Can't select a winner");
                    }
                    return [2 /*return*/, all.sort(function (issueA, issueB) {
                            var positiveA = reactions_1.getPosititiveReactionsCount(issueA.reactions);
                            var positiveB = reactions_1.getPosititiveReactionsCount(issueB.reactions);
                            return positiveA < positiveB ? -1 : positiveA > positiveB ? 1 : 0;
                        })[0]['issue']];
            }
        });
    });
}
exports.getMostVoted = getMostVoted;
function commitWinningIssue(issue, contestPeriod) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, ref, latestCommit, baseTree, filename, content, newTreeSha, commitMessage, newCommitSha, commitUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    ref = 'heads/master';
                    return [4 /*yield*/, gh.git.getRef({ owner: config_1.owner, repo: config_1.repo, ref: ref })];
                case 1:
                    latestCommit = (_a.sent()).data.object.sha;
                    return [4 /*yield*/, gh.git.getTree({ owner: config_1.owner, repo: config_1.repo, tree_sha: latestCommit })];
                case 2:
                    baseTree = (_a.sent()).data.sha;
                    filename = 'next.html';
                    return [4 /*yield*/, template_1.prepareContentFile({
                            content: issue.body,
                            content_creator_url: issue.user.html_url,
                            content_creator_handle: issue.user.login
                        })];
                case 3:
                    content = _a.sent();
                    return [4 /*yield*/, gh.git.createTree({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            tree: [{ path: filename, mode: '100644', type: 'blob', content: content }],
                            base_tree: baseTree
                        })];
                case 4:
                    newTreeSha = (_a.sent()).data.sha;
                    commitMessage = "Content for week " + contestPeriod.fullLabel;
                    return [4 /*yield*/, gh.git.createCommit({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            message: commitMessage,
                            tree: newTreeSha,
                            parents: [latestCommit]
                        })];
                case 5:
                    newCommitSha = (_a.sent()).data.sha;
                    return [4 /*yield*/, gh.git.updateRef({ owner: config_1.owner, repo: config_1.repo, ref: ref, sha: newCommitSha })];
                case 6:
                    _a.sent();
                    commitUrl = "https://github.com/" + config_1.owner + "/" + config_1.repo + "/commit/" + newCommitSha;
                    return [2 /*return*/, { sha: newCommitSha, url: commitUrl }];
            }
        });
    });
}
function markAsWinnerIssue(issue, period) {
    return __awaiter(this, void 0, void 0, function () {
        var winnerLabel, gh, _a, commitSha, commitUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("I will make #" + issue.number + " the next contest content");
                    winnerLabel = config_1.config.WINNER_LABEL;
                    gh = gh_1.getGhClient();
                    if (!winnerLabel) {
                        throw new Error('No label found.');
                    }
                    if (!issue) {
                        throw new Error('No issue found.');
                    }
                    return [4 /*yield*/, gh.issues.addLabels({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            issue_number: issue.number,
                            labels: [winnerLabel]
                        })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, commitWinningIssue(issue, period)];
                case 2:
                    _a = _b.sent(), commitSha = _a.sha, commitUrl = _a.url;
                    return [4 /*yield*/, gh.issues.createComment({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            issue_number: issue.number,
                            body: content_1.issueSelected(commitSha, commitUrl)
                        })];
                case 3:
                    _b.sent();
                    return [2 /*return*/, issue];
            }
        });
    });
}
function closeIssuesForPeriod(period, issueFilter, comment) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, issues;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.issues.listForRepo({ owner: config_1.owner, repo: config_1.repo, labels: period.fullLabel })];
                case 1:
                    issues = (_a.sent()).data;
                    return [4 /*yield*/, Promise.all(issues.filter(issueFilter).map(function (issue) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, gh.issues.update({ owner: config_1.owner, repo: config_1.repo, issue_number: issue.number, state: 'closed' })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: issue.number, body: comment })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.closeIssuesForPeriod = closeIssuesForPeriod;
function selectWinner(date) {
    if (date === void 0) { date = moment_1["default"](); }
    return __awaiter(this, void 0, void 0, function () {
        var period, issues_1, mostVotedIssue, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    period = contest_1.getContestPeriod(date.add(1, 'w'));
                    return [4 /*yield*/, getIssues(period.fullLabel, excludePullRequest)];
                case 1:
                    issues_1 = _a.sent();
                    return [4 /*yield*/, getMostVoted(issues_1)];
                case 2:
                    mostVotedIssue = _a.sent();
                    Promise.all([
                        markAsWinnerIssue(mostVotedIssue, period),
                        closeIssuesForPeriod(period, excludePullRequest, content_1.closingIssueComment),
                    ]);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('I am sorry but I was unable to select a winner due to the error bellow:\n', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.issues = {
    verify: verify,
    selectWinner: selectWinner
};
