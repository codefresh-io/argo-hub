const _ = require('lodash')
const fs = require('fs');


const OUTPUT_DIR = '/tmp/gitvars/'

function writeVarFile(name, value) {
    // # Write the value to output file
    fs.writeFileSync(`${OUTPUT_DIR}${name}`, value);
    console.log(`${name} = + ${value}`)
}

function _getBaseGitInfoFromJson(payloadDict) {
    if (_.get(payloadDict, 'event_type') === 'merge_request') {
        const commitInfo = _.get(payloadDict, 'object_attributes.last_commit', {});
        const isMerged = _.get(payloadDict, 'object_attributes.state') === 'merged';
        const branch = _.get(payloadDict, 'object_attributes.source_branch', '');
        return {
            branch,
            sha: _.get(commitInfo, 'id', ''),
            commitInfo,
            isMerged: `${isMerged}`,
            commitUsername: _.get(payloadDict, 'user.username', ''),
            headBranch: branch
        }
    }
    const ref = _.get(payloadDict, 'ref', '');
    const commitInfo = _.last(payloadDict.commits)
    return {
        branch: ref.replace('refs/heads/', ''),
        sha:  _.get(payloadDict, 'after', ''),
        commitInfo,
        isMerged: '',
        commitUsername: _.get(payloadDict, 'user_username', ''),
        headBranch: ''

    }
}

function resolveVariablesFromJson(payloadDict) {
    const fullName = _.get(payloadDict, 'project.path_with_namespace', '/');
    const splittedName = fullName.split('/');
    const repoName = _.last(splittedName);
    const repoOwner = _.pull(splittedName, repoName).join('/');
    const { branch, sha, commitInfo, isMerged, commitUsername, headBranch } = _getBaseGitInfoFromJson(payloadDict)
    const commitAuthor = _.get(commitInfo, 'author.name', '');

    const commitEmail = _.get(commitInfo, 'author.email', '');
    const commitURL = _.get(commitInfo, 'url', '');
    const message = _.get(commitInfo, 'message', '');

    const targetBranch = _.get(payloadDict, 'object_attributes.target_branch', '');
    const pullRequestAction = _.get(payloadDict, 'object_attributes.action', '');
    const pullRequestId = _.get(payloadDict, 'object_attributes.iid', '');

    const pullRequestLabels = _.get(payloadDict, 'labels', []).map((label) => {
        return String(_.get(label, 'title'));
    }).join(', ');
    const headCommitSha = _.get(payloadDict, 'object_attributes.merge_commit_sha', '');
    const mergeCommitSha = _.get(payloadDict, 'object_attributes.last_commit.id', '');

    return {
        repoName,
        repoOwner,
        branch,
        sha,
        commitAuthor,
        commitUsername,
        commitEmail,
        commitURL,
        message,
        targetBranch,
        pullRequestAction,
        pullRequestId: `${pullRequestId}`,
        headBranch,
        isMerged,
        pullRequestLabels,
        headCommitSha,
        mergeCommitSha
    };

}

function saveVariablesToFiles(variables) {

    writeVarFile('CF_BRANCH', variables.branch)
    writeVarFile('CF_REVISION', variables.sha)
    writeVarFile('CF_SHORT_REVISION', variables.sha.substring(0,7))
    writeVarFile('CF_REPO_NAME', variables.repoName)
    writeVarFile('CF_REPO_OWNER', variables.repoOwner)

    writeVarFile('CF_BASE_BRANCH', variables.targetBranch)
    writeVarFile('CF_COMMIT_AUTHOR', variables.commitAuthor)
    writeVarFile('CF_COMMIT_USERNAME', variables.commitUsername)
    writeVarFile('CF_COMMIT_EMAIL', variables.commitEmail)
    writeVarFile('CF_COMMIT_URL', variables.commitURL)
    writeVarFile('CF_COMMIT_MESSAGE', variables.message);

    writeVarFile('CF_PULL_REQUEST_ACTION', variables.pullRequestAction)
    writeVarFile('CF_PULL_REQUEST_TARGET', variables.targetBranch)
    writeVarFile('CF_PULL_REQUEST_ID', variables.pullRequestId)
    writeVarFile('CF_PULL_REQUEST_LABELS', variables.pullRequestLabels)

    writeVarFile('CF_PULL_REQUEST_MERGED', variables.isMerged);
    writeVarFile('CF_PULL_REQUEST_HEAD_BRANCH', variables.headBranch)
    writeVarFile('CF_PULL_REQUEST_MERGED_COMMIT_SHA', variables.mergeCommitSha)
    writeVarFile('CF_PULL_REQUEST_HEAD_COMMIT_SHA', variables.headCommitSha)

}

const main = async () => {
    const payloadJson = process.env.GITLAB_JSON
    if(!payloadJson) {
        throw new Error('Empty');
    }
    const payloadDict = JSON.parse(payloadJson);
    if (!fs.existsSync(OUTPUT_DIR)){
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    try {
        const variables = resolveVariablesFromJson(payloadDict);
        saveVariablesToFiles(variables);
    } catch (e) {
        throw new Error(`Failed to extract variables from gitlab json with error: ${JSON.stringify(err ? err.message : '')}`);
    }
}

main();
