"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.pullRequests = void 0;
var axios_1 = __importDefault(require("axios"));
var moment_1 = __importDefault(require("moment"));
var gh_1 = require("./gh");
var config_1 = require("./config");
var contest_1 = require("./contest");
var content_1 = require("./content");
var reactions_1 = require("./reactions");
var deploy_1 = require("./deploy");
var issue_1 = require("./issue");
var template_1 = require("./template");
function removeLineBreaks(text) {
    return text.replace(/(\r\n|\n|\r)/gm, '');
}
function getFileRawContent(rawContentUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1["default"].get(rawContentUrl)];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data];
            }
        });
    });
}
function verifyFiles(prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, prFiles, allowedFiles, files, areChangedFilesAllowed, nextHtml, prHtml, _a, nextHtmlContent, prHtmlContent, _b, isHtmlContentCorrect, error;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.pulls.listFiles({ owner: config_1.owner, repo: config_1.repo, pull_number: prNumber })];
                case 1:
                    prFiles = (_c.sent()).data;
                    allowedFiles = ['styles.css', 'index.html'];
                    files = prFiles.map(function (file) { return (__assign(__assign({}, file), { githubFileType: 'pr' })); });
                    areChangedFilesAllowed = files.length === 2 &&
                        files.reduce(function (areAllowed, _a) {
                            var filename = _a.filename;
                            return areAllowed && allowedFiles.includes(filename);
                        }, true);
                    return [4 /*yield*/, getNextIndexHtml()];
                case 2:
                    nextHtml = _c.sent();
                    prHtml = files.filter(function (_a) {
                        var filename = _a.filename;
                        return filename === 'index.html';
                    })[0];
                    if (!!prHtml) return [3 /*break*/, 4];
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.pullRequestInvalidAcknowledge })];
                case 3:
                    _c.sent();
                    throw new Error('Missing HTML content change.');
                case 4: return [4 /*yield*/, getFileRawContent(nextHtml.download_url)];
                case 5:
                    _b = [
                        _c.sent()
                    ];
                    return [4 /*yield*/, getFileRawContent(prHtml.raw_url)];
                case 6:
                    _a = __read.apply(void 0, [_b.concat([
                            _c.sent()
                        ]), 2]), nextHtmlContent = _a[0], prHtmlContent = _a[1];
                    isHtmlContentCorrect = removeLineBreaks(nextHtmlContent) === removeLineBreaks(prHtmlContent);
                    error = !areChangedFilesAllowed
                        ? 'PR contains invalid files'
                        : !isHtmlContentCorrect
                            ? 'PR contains invalid HTML content'
                            : undefined;
                    return [2 /*return*/, [areChangedFilesAllowed && isHtmlContentCorrect, files, error]];
            }
        });
    });
}
function invalidatePullRequest(prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var gh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.pullRequestClosedDueToChanges })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getNextIndexHtml() {
    return __awaiter(this, void 0, void 0, function () {
        var gh, fileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    return [4 /*yield*/, gh.repos.getContent({ owner: config_1.owner, repo: config_1.repo, path: 'next.html' })];
                case 1:
                    fileContent = (_a.sent()).data;
                    return [2 /*return*/, __assign(__assign({}, fileContent), { githubFileType: 'content' })];
            }
        });
    });
}
function verifyAndDeploy(prNumber, action, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var reactions, _a, areFilesValid, files, error, gh, deployUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!['opened', 'edited', 'synchronize'].includes(action)) {
                        throw new Error("Not supported webhook action: " + action);
                    }
                    if (!payload) {
                        throw new Error('Missing webhook payload.');
                    }
                    return [4 /*yield*/, reactions_1.getReactions(prNumber)];
                case 1:
                    reactions = _b.sent();
                    if (!(action === 'synchronize' && reactions.length)) return [3 /*break*/, 3];
                    return [4 /*yield*/, invalidatePullRequest(prNumber)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, verifyFiles(prNumber)];
                case 4:
                    _a = __read.apply(void 0, [_b.sent(), 3]), areFilesValid = _a[0], files = _a[1], error = _a[2];
                    gh = gh_1.getGhClient();
                    if (!!areFilesValid) return [3 /*break*/, 6];
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.invalidPullRequest(error) })];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
                case 6: return [4 /*yield*/, assingPullRequestToCurrentWeek(prNumber)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, deploy_1.deployPullRequestPreview(prNumber, files, {
                            url: payload.pull_request.user.html_url,
                            handle: payload.pull_request.user.login
                        })];
                case 8:
                    deployUrl = _b.sent();
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.previewDeployed(deployUrl) })];
                case 9:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function assingPullRequestToCurrentWeek(prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, prLabel, contestPeriod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    prLabel = config_1.config.PULL_REQUEST_LABEL;
                    contestPeriod = contest_1.getContestPeriod(moment_1["default"]());
                    return [4 /*yield*/, gh.issues.addLabels({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, labels: [contestPeriod.fullLabel, prLabel] })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, gh.issues.addAssignees({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, assignees: ['janethebot'] })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.pullRequetsAssigned })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function excludeIssues(issue) {
    return !!issue.pull_request;
}
function updateProduction(contestPeriod, styleCreatorLogin, styleCreatorUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, ref, indexFileContent, cssFile, latestCommit, baseTree, newTreeSha, commitMessage, newCommitSha;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    ref = 'heads/master';
                    return [4 /*yield*/, template_1.prepareContentFile({
                            style_creator_url: styleCreatorUrl,
                            style_creator_handle: styleCreatorLogin
                        }, 'index.html')];
                case 1:
                    indexFileContent = _a.sent();
                    return [4 /*yield*/, gh.repos.getContent({ owner: config_1.owner, repo: config_1.repo, path: 'styles.css' })];
                case 2:
                    cssFile = (_a.sent()).data;
                    return [4 /*yield*/, gh.git.getRef({ owner: config_1.owner, repo: config_1.productionRepo, ref: ref })];
                case 3:
                    latestCommit = (_a.sent()).data.object.sha;
                    return [4 /*yield*/, gh.git.getTree({ owner: config_1.owner, repo: config_1.productionRepo, tree_sha: latestCommit })];
                case 4:
                    baseTree = (_a.sent()).data.sha;
                    return [4 /*yield*/, gh.git.createTree({
                            owner: config_1.owner,
                            repo: config_1.productionRepo,
                            tree: [
                                {
                                    path: 'index.html',
                                    mode: '100644',
                                    type: 'blob',
                                    content: indexFileContent
                                },
                                {
                                    path: 'styles.css',
                                    mode: '100644',
                                    type: 'blob',
                                    content: Buffer.from(cssFile.content, 'base64').toString('utf8')
                                },
                            ],
                            base_tree: baseTree
                        })];
                case 5:
                    newTreeSha = (_a.sent()).data.sha;
                    commitMessage = "Content for week " + contestPeriod.fullLabel;
                    return [4 /*yield*/, gh.git.createCommit({
                            owner: config_1.owner,
                            repo: config_1.productionRepo,
                            message: commitMessage,
                            tree: newTreeSha,
                            parents: [latestCommit]
                        })];
                case 6:
                    newCommitSha = (_a.sent()).data.sha;
                    return [4 /*yield*/, gh.git.updateRef({ owner: config_1.owner, repo: config_1.productionRepo, ref: ref, sha: newCommitSha })];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function makeWinner(prNumber, period) {
    return __awaiter(this, void 0, void 0, function () {
        var gh, winningPrLabel, _a, login, loginUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gh = gh_1.getGhClient();
                    winningPrLabel = config_1.config.PULL_REQUEST_WINNER;
                    return [4 /*yield*/, gh.pulls.get({ owner: config_1.owner, repo: config_1.repo, pull_number: prNumber })];
                case 1:
                    _a = (_b.sent()).data.user, login = _a.login, loginUrl = _a.html_url;
                    return [4 /*yield*/, gh.issues.addLabels({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, labels: [winningPrLabel] })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, gh.issues.createComment({ owner: config_1.owner, repo: config_1.repo, issue_number: prNumber, body: content_1.pullRequetsWinnerComment })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, gh.pulls.merge({
                            owner: config_1.owner,
                            repo: config_1.repo,
                            pull_number: prNumber,
                            commit_title: content_1.pullRequestWinnerCommit(period.fullLabel)
                        })];
                case 4:
                    _b.sent();
                    return [2 /*return*/, [login, loginUrl]];
            }
        });
    });
}
function selectWinner(date) {
    if (date === void 0) { date = moment_1["default"](); }
    return __awaiter(this, void 0, void 0, function () {
        var period, prs, mostVotedPr, _a, winnerLogin, winnerUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    period = contest_1.getContestPeriod(date);
                    return [4 /*yield*/, issue_1.getIssues(period.fullLabel, excludeIssues)];
                case 1:
                    prs = _b.sent();
                    return [4 /*yield*/, issue_1.getMostVoted(prs)];
                case 2:
                    mostVotedPr = _b.sent();
                    return [4 /*yield*/, makeWinner(mostVotedPr.number, period)];
                case 3:
                    _a = __read.apply(void 0, [_b.sent(), 2]), winnerLogin = _a[0], winnerUrl = _a[1];
                    return [4 /*yield*/, issue_1.closeIssuesForPeriod(period, excludeIssues, content_1.closingPRComment)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, updateProduction(period, winnerLogin, winnerUrl)];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.pullRequests = {
    verifyAndDeploy: verifyAndDeploy,
    selectWinner: selectWinner
};
