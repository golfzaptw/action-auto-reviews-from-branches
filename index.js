const core = require('@actions/core')
const github = require('@actions/github')

try {
  const githubToken = core.getInput('GITHUB_TOKEN')
  const eventType = core.getInput('EVENT_TYPE')
  const branch = core.getInput('BRANCHES')
  const message = core.getInput('MESSAGE')
  const pullRequest = github.context.payload.pull_request
  const prNumber = pullRequest.number
  const headBranch = pullRequest.head.ref
  const result = new RegExp(branch, 'g').test(headBranch)
  let body

  if (!pullRequest) {
    core.setFailed(
      `This action isn't pull requests.Please run this action on: pull_request`,
    )
    process.exit(1)
  }

  if (
    (eventType === 'COMMENT' || eventType === 'REQUEST_CHANGES') &&
    !message
  ) {
    core.setFailed(
      `EVENT_TYPE is a COMMENT or REQUEST_CHANGES required a MESSAGE.`,
    )
    process.exit(1)
  }

  if (eventType === 'APPROVE' && !message) {
    body = '🏳️‍🌈Success approve. Enjoy 🙏.'
  } else {
    body = message
  }

  if (result) {
    pullRequestReviews({
      token: githubToken,
      prNumber: prNumber,
      message: body,
      eventType: eventType,
    })
  } else {
    core.warning(`Branch not found at input`)
  }
} catch (err) {
  core.error(err)
  core.setFailed(err.message)
}

async function pullRequestReviews({token, prNumber, message, eventType}) {
  const octokit = new github.GitHub(token)
  await octokit.pulls
    .createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      body: message,
      event: eventType,
    })
    .then(() => {
      core.info(`Done.Please see at pull_request #${prNumber}`)
    })
    .catch(err => {
      core.error(err)
      core.setFailed(err.message)
    })
}
