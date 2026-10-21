import createIssueParser from 'issue-parser'
import { getInfo, type GitInfo } from '#/src/utils/git/get-info.js'
import { getPullRequestNumber } from '#/src/utils/git/get-pull-request-number.js'
import type { ParsedCommitWithHash } from '#/src/utils/git/parse-commits.js'

const parser = createIssueParser('github')

function extractIssueIds(text: string, repo: GitInfo): Set<string> {
  const ids = new Set<string>()
  const parsed = parser(text)

  for (const action of parsed.actions.close) {
    if (action.slug == null || action.slug === `${repo.owner}/${repo.name}`) {
      ids.add(action.issue)
    }
  }

  return ids
}

export async function getReleaseRefs(
  commits: ParsedCommitWithHash[],
): Promise<Set<string>> {
  const repo = await getInfo()
  const issueIds = new Set<string>()

  for (const commit of commits) {
    // Only the subject's pull request: the parsed references also include
    // anything in the body that looks like "#123".
    const pullRequestNumber = getPullRequestNumber(commit)
    if (pullRequestNumber) {
      issueIds.add(pullRequestNumber)
    }

    // Extract closed issue ids from the commit bodies. The parser puts a
    // trailing "Closes #1" paragraph in the footer, not the body.
    const messageAfterSubject = [commit.body, commit.footer]
      .filter(Boolean)
      .join('\n\n')
    if (messageAfterSubject) {
      const bodyIssueIds = extractIssueIds(messageAfterSubject, repo)
      bodyIssueIds.forEach((id) => issueIds.add(id))
    }
  }

  // Fetch issue detail from each issue referenced in the commit message
  // or commit body. Those may include pull request ids that reference
  // other issues.
  const issuesFromCommits = await Promise.all(
    Array.from(issueIds).map(fetchIssue),
  )

  // Extract issue ids from the pull request descriptions.
  for (const issue of issuesFromCommits) {
    // Ignore regular issues as they may not close/fix other issues
    // by reference (at least on GitHub).
    if (!issue.pull_request || !issue.body) {
      continue
    }

    const descriptionIssueIds = extractIssueIds(issue.body, repo)
    descriptionIssueIds.forEach((id) => issueIds.add(id))
  }

  return issueIds
}

export interface IssueOrPullRequest {
  html_url: string
  pull_request: Record<string, string> | null
  body: string | null
}

async function fetchIssue(id: string): Promise<IssueOrPullRequest> {
  const repo = await getInfo()
  const response = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    },
  )
  const resource = (await response.json()) as Promise<IssueOrPullRequest>

  return resource
}
