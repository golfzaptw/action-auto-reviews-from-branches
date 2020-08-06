const core = require('@actions/core')
const github = require('@actions/github')

try {
  // Core Input
  const githubToken = core.getInput('GITHUB_TOKEN', {required: true})
  const eventType = core.getInput('EVENT_TYPE', {required: true})
  const branch = core.getInput('BRANCHES')
  const message = core.getInput('MESSAGE')
  const author = core.getInput('AUTHOR')
  // Github context
  const headAuthor = github.context.actor
  const pullRequest = github.context.payload.pull_request
  const prNumber = pullRequest.number
  const headBranch = pullRequest.head.ref

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

  const resultBranch = new RegExp(branch, 'g').test(headBranch)
  if (resultBranch) {
    // Branches equal input
    pullRequestReviews({
      token: githubToken,
      prNumber: prNumber,
      message: message,
      eventType: eventType,
    })
  } else {
    // Regex check
    const arrayAuthor = author.split(',')
    for (let index = 0; index < arrayAuthor.length; index++) {
      if (arrayAuthor[index].trim() === headAuthor) {
        pullRequestReviews({
          token: githubToken,
          prNumber: prNumber,
          message: message,
          eventType: eventType,
        })
        break
      }
      if (index === arrayAuthor.length - 1) {
        core.warning('BRANCHES or AUTHOR not found at input')
      }
    }
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
      core.info(`Done. Please see at pull_request #${prNumber} 🎉`)
    })
    .catch((err) => {
      core.error(err)
      core.setFailed(err.message)
    })
}
