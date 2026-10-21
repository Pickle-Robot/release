import { getPullRequestNumber } from '#/src/utils/git/get-pull-request-number.js'
import { parseCommits } from '#/src/utils/git/parse-commits.js'
import { mockCommit } from '#/test/fixtures.js'

it('returns the pull request number at the end of a squash-merge subject', async () => {
  const commits = await parseCommits([
    mockCommit({ subject: 'fix(ui): handle errors (#12)' }),
    mockCommit({ subject: 'feat!: drop legacy api (#3)' }),
    mockCommit({ subject: 'Make features better (#15)' }),
  ])

  expect(commits.map(getPullRequestNumber)).toEqual(['12', '3', '15'])
})

it('returns undefined when the subject does not end with a pull request number', async () => {
  const commits = await parseCommits([
    mockCommit({ subject: 'Merge pull request #9 from octocat/feature' }),
    mockCommit({ subject: 'fix: follow up on (#12) from last week' }),
    mockCommit({
      subject: 'feat: branch commit',
      body: 'Part of (#7)',
    }),
  ])

  expect(commits.map(getPullRequestNumber)).toEqual([
    undefined,
    undefined,
    undefined,
  ])
})
