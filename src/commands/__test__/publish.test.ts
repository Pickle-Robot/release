import * as fileSystem from 'fs'
import { ResponseResolver, graphql, rest } from 'msw'
import { log } from '../../logger'
import { Publish } from '../publish'
import type { GitHubRelease } from '../../utils/github/getGitHubRelease'
import { testEnvironment } from '../../../test/env'
import { execAsync } from '../../utils/execAsync'

const { setup, reset, cleanup, api, createRepository } = testEnvironment({
  fileSystemPath: './publish',
})

beforeAll(async () => {
  await setup()
})

afterEach(async () => {
  await reset()
})

afterAll(async () => {
  await cleanup()
})

it('publishes the next minor version', async () => {
  const repo = await createRepository('version-next-minor')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '0.0.0',
    }),
  })
  await repo.fs.exec(`git add . && git commit -m 'feat: new things'`)

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'echo "release script input: $RELEASE_VERSION"',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.error).not.toHaveBeenCalled()

  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('found 2 new commits:'),
  )

  // Must notify about the next version.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 0.0.0 -> 0.1.0')

  // The release script is provided with the environmental variables.
  expect(process.stdout.write).toHaveBeenCalledWith(
    'release script input: 0.1.0\n',
  )
  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('bumped version in package.json to: 0.1.0'),
  )

  // Must bump the "version" in package.json.
  expect(
    JSON.parse(await repo.fs.readFile('package.json', 'utf8')),
  ).toHaveProperty('version', '0.1.0')

  expect(await repo.fs.exec('git log')).toHaveProperty(
    'stdout',
    expect.stringContaining('chore(release): v0.1.0'),
  )

  // Must create a new tag for the release.
  expect(await repo.fs.exec('git tag')).toHaveProperty(
    'stdout',
    expect.stringContaining('0.1.0'),
  )

  expect(log.info).toHaveBeenCalledWith('created release: /releases/1')
  expect(log.info).toHaveBeenCalledWith('release "v0.1.0" completed!')
})

it('releases a new version after an existing version', async () => {
  const repo = await createRepository('version-new-after-existing')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '1.2.3',
    }),
  })
  await execAsync(`git commit -m 'chore(release): v1.2.3' --allow-empty`)
  await execAsync('git tag v1.2.3')
  await execAsync(`git commit -m 'fix: stuff' --allow-empty`)
  await execAsync(`git commit -m 'feat: stuff' --allow-empty`)

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'echo "release script input: $RELEASE_VERSION"',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.error).not.toHaveBeenCalled()
  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('found 2 new commits:'),
  )

  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('found latest release: v1.2.3'),
  )

  // Must notify about the next version.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 1.2.3 -> 1.3.0')

  // The release script is provided with the environmental variables.
  expect(process.stdout.write).toHaveBeenCalledWith(
    'release script input: 1.3.0\n',
  )
  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('bumped version in package.json to: 1.3.0'),
  )

  // Must bump the "version" in package.json.
  expect(
    JSON.parse(await repo.fs.readFile('package.json', 'utf8')),
  ).toHaveProperty('version', '1.3.0')

  expect(await repo.fs.exec('git log')).toHaveProperty(
    'stdout',
    expect.stringContaining('chore(release): v1.3.0'),
  )

  // Must create a new tag for the release.
  expect(await repo.fs.exec('git tag')).toHaveProperty(
    'stdout',
    expect.stringContaining('v1.3.0'),
  )

  expect(log.info).toHaveBeenCalledWith('created release: /releases/1')
  expect(log.info).toHaveBeenCalledWith('release "v1.3.0" completed!')
})

it('comments on relevant github issues', async () => {
  const repo = await createRepository('issue-comments')

  const commentsCreated = new Map<string, string>()

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(
        ctx.data({
          repository: {
            pullRequest: {
              author: { login: 'octocat' },
              commits: {
                nodes: [],
              },
            },
          },
        }),
      )
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
    rest.get(
      'https://api.github.com/repos/:owner/:repo/issues/:id',
      (req, res, ctx) => {
        return res(ctx.json({}))
      },
    ),
    rest.post<{ body: string }>(
      'https://api.github.com/repos/:owner/:repo/issues/:id/comments',
      (req, res, ctx) => {
        commentsCreated.set(req.params.id as string, req.body.body)
        return res(ctx.status(201))
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '0.0.0',
    }),
  })
  await repo.fs.exec(
    `git commit -m 'feat: supports graphql (#10)' --allow-empty`,
  )

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'echo "release script input: $RELEASE_VERSION"',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.info).toHaveBeenCalledWith('commenting on 1 GitHub issue:\n  - 10')
  expect(commentsCreated).toEqual(
    new Map([['10', expect.stringContaining('## Released: v0.1.0 🎉')]]),
  )

  expect(log.info).toHaveBeenCalledWith('release "v0.1.0" completed!')
})

it('supports dry-run mode', async () => {
  const repo = await createRepository('dry-mode')

  const getReleaseContributorsResolver = jest.fn<
    ReturnType<ResponseResolver>,
    Parameters<ResponseResolver>
  >((req, res, ctx) => {
    return res(ctx.status(500))
  })
  const createGitHubReleaseResolver = jest.fn<
    ReturnType<ResponseResolver>,
    Parameters<ResponseResolver>
  >((req, res, ctx) => {
    return res(ctx.status(500))
  })

  api.use(
    graphql.query('GetCommitAuthors', getReleaseContributorsResolver),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      createGitHubReleaseResolver,
    ),
    rest.get(
      'https://api.github.com/repos/:owner/:repo/issues/:id',
      (req, res, ctx) => {
        return res(ctx.json({}))
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '1.2.3',
    }),
  })
  await execAsync(`git commit -m 'chore(release): v1.2.3' --allow-empty`)
  await execAsync('git tag v1.2.3')
  await execAsync(`git commit -m 'fix: stuff (#2)' --allow-empty`)
  await execAsync(`git commit -m 'feat: stuff' --allow-empty`)

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'touch release.script.artifact',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
      dryRun: true,
    },
  )
  await publish.run()

  expect(log.info).toHaveBeenCalledWith(
    'preparing release for "octocat/dry-mode" from branch "main"...',
  )
  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('found 2 new commits:'),
  )

  // Package.json version bump.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 1.2.3 -> 1.3.0')
  expect(log.warn).toHaveBeenCalledWith(
    'skip version bump in package.json in dry-run mode (next: 1.3.0)',
  )
  expect(
    JSON.parse(await repo.fs.readFile('package.json', 'utf8')),
  ).toHaveProperty('version', '1.2.3')

  // Publishing script.
  expect(log.warn).toHaveBeenCalledWith(
    'skip executing publishing script in dry-run mode',
  )
  expect(
    fileSystem.existsSync(repo.fs.resolve('release.script.artifact')),
  ).toBe(false)

  // No release commit must be created.
  expect(log.warn).toHaveBeenCalledWith(
    'skip creating a release commit in dry-run mode: "chore(release): v1.3.0"',
  )
  expect(log.info).not.toHaveBeenCalledWith('created release commit!')

  // No release tag must be created.
  expect(log.warn).toHaveBeenCalledWith(
    'skip creating a release tag in dry-run mode: v1.3.0',
  )
  expect(log.info).not.toHaveBeenCalledWith('created release tag "v1.3.0"!')
  expect(await execAsync('git tag')).toEqual({
    stderr: '',
    stdout: 'v1.2.3\n',
  })

  // Release notes must still be generated.
  expect(log.info).toHaveBeenCalledWith(
    expect.stringContaining('generated release notes:\n\n## v1.3.0'),
  )

  expect(createGitHubReleaseResolver).not.toHaveBeenCalled()

  // The actual GitHub release must not be created.
  expect(log.warn).toHaveBeenCalledWith(
    'skip creating a GitHub release in dry-run mode',
  )

  // Dry mode still gets all release contributors because
  // it's a read operation.
  expect(getReleaseContributorsResolver).toHaveBeenCalledTimes(1)

  expect(log.warn).toHaveBeenCalledWith(
    'release "v1.3.0" completed in dry-run mode!',
  )
})

it('streams the release script stdout to the main process', async () => {
  const repo = await createRepository('stream-stdout')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'publish-stream',
    }),
    'stream-stdout.js': `
console.log('hello')
setTimeout(() => console.log('world'), 100)
setTimeout(() => process.exit(0), 150)
      `,
  })
  await execAsync(
    `git commit -m 'feat: stream release script stdout' --allow-empty`,
  )

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'node stream-stdout.js',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )

  await publish.run()

  // Must log the release script stdout.
  expect(process.stdout.write).toHaveBeenCalledWith('hello\n')
  expect(process.stdout.write).toHaveBeenCalledWith('world\n')

  // Must report a successful release.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 0.0.0 -> 0.1.0')
  expect(log.info).toHaveBeenCalledWith('release "v0.1.0" completed!')
})

it('streams the release script stderr to the main process', async () => {
  const repo = await createRepository('stream-stderr')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'publish-stream',
    }),
    'stream-stderr.js': `
console.error('something')
setTimeout(() => console.error('went wrong'), 100)
setTimeout(() => process.exit(0), 150)
      `,
  })
  await execAsync(
    `git commit -m 'feat: stream release script stderr' --allow-empty`,
  )

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'node stream-stderr.js',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )

  await publish.run()

  // Must log the release script stderr.
  expect(process.stderr.write).toHaveBeenCalledWith('something\n')
  expect(process.stderr.write).toHaveBeenCalledWith('went wrong\n')

  // Must report a successful release.
  // As long as the publish script doesn't exit, it is successful.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 0.0.0 -> 0.1.0')
  expect(log.info).toHaveBeenCalledWith('release "v0.1.0" completed!')
})

it('only pushes the newly created release tag to the remote', async () => {
  const repo = await createRepository('push-release-tag')

  await repo.fs.create({
    'package.json': JSON.stringify({ name: 'push-tag', version: '1.0.0' }),
  })

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  // Create an existing tag
  await execAsync(`git tag v1.0.0`)
  await execAsync(`git push origin v1.0.0`)

  // Create a new commit.
  await execAsync(`git commit -m 'feat: new feature' --allow-empty`)

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'exit 0',
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.info).toHaveBeenCalledWith('release type "minor": 1.0.0 -> 1.1.0')
  expect(log.info).toHaveBeenCalledWith('release "v1.1.0" completed!')
})

it('treats breaking changes as minor versions when "prerelease" is set to true', async () => {
  const repo = await createRepository('prerelease-major-as-minor')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '0.1.2',
    }),
  })
  await execAsync(`git commit -m 'chore(release): v0.1.2' --allow-empty`)
  await execAsync('git tag v0.1.2')
  await repo.fs.exec(
    `git add . && git commit -m 'feat: new things' -m 'BREAKING CHANGE: beware'`,
  )

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'echo "release script input: $RELEASE_VERSION"',
          // This forces breaking changes to result in a minor
          // version bump.
          prerelease: true,
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.error).not.toHaveBeenCalled()

  // Must bump the minor version upon breaking change
  // due to the "prerelease" configuration set.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 0.1.2 -> 0.2.0')

  // Must expose the correct environment variable
  // to the publish script.
  expect(process.stdout.write).toHaveBeenCalledWith(
    'release script input: 0.2.0\n',
  )

  // Must bump the "version" in package.json.
  expect(
    JSON.parse(await repo.fs.readFile('package.json', 'utf8')),
  ).toHaveProperty('version', '0.2.0')

  expect(await repo.fs.exec('git log')).toHaveProperty(
    'stdout',
    expect.stringContaining('chore(release): v0.2.0'),
  )

  expect(log.info).toHaveBeenCalledWith('release "v0.2.0" completed!')
})

it('treats minor bumps as minor versions when "prerelease" is set to true', async () => {
  const repo = await createRepository('prerelease-major-as-minor')

  api.use(
    graphql.query('GetCommitAuthors', (req, res, ctx) => {
      return res(ctx.data({}))
    }),
    rest.post<never, never, GitHubRelease>(
      'https://api.github.com/repos/:owner/:repo/releases',
      (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({
            html_url: '/releases/1',
          }),
        )
      },
    ),
  )

  await repo.fs.create({
    'package.json': JSON.stringify({
      name: 'test',
      version: '0.0.0',
    }),
  })
  await repo.fs.exec(`git add . && git commit -m 'feat: new things'`)

  const publish = new Publish(
    {
      profiles: [
        {
          name: 'latest',
          use: 'echo "release script input: $RELEASE_VERSION"',
          // This forces breaking changes to result in a minor
          // version bump.
          prerelease: true,
        },
      ],
    },
    {
      _: [],
      profile: 'latest',
    },
  )
  await publish.run()

  expect(log.error).not.toHaveBeenCalled()

  // Must bump the minor version upon breaking change
  // due to the "prerelease" configuration set.
  expect(log.info).toHaveBeenCalledWith('release type "minor": 0.0.0 -> 0.1.0')

  // Must expose the correct environment variable
  // to the publish script.
  expect(process.stdout.write).toHaveBeenCalledWith(
    'release script input: 0.1.0\n',
  )

  // Must bump the "version" in package.json.
  expect(
    JSON.parse(await repo.fs.readFile('package.json', 'utf8')),
  ).toHaveProperty('version', '0.1.0')

  expect(await repo.fs.exec('git log')).toHaveProperty(
    'stdout',
    expect.stringContaining('chore(release): v0.1.0'),
  )

  expect(log.info).toHaveBeenCalledWith('release "v0.1.0" completed!')
})
