import { mockCommit } from '#/test/fixtures.js'
import { parseCommits } from '#/src/utils/git/parse-commits.js'

it('parses commits with the "!" type appendix', async () => {
  expect(
    await parseCommits([
      mockCommit({
        subject: 'feat!: some breaking change',
      }),
      mockCommit({
        subject: 'fix(myScope)!: another change',
        body: 'commit body',
      }),
    ]),
  ).toEqual([
    {
      hash: '',
      type: 'feat',
      typeAppendix: '!',
      header: 'feat: some breaking change',
      subject: 'some breaking change',
      body: null,
      footer: null,
      merge: null,
      revert: null,
      scope: null,
      notes: [],
      mentions: [],
      references: [],
    },
    {
      hash: '',
      type: 'fix',
      typeAppendix: '!',
      header: 'fix(myScope): another change',
      subject: 'another change',
      body: 'commit body',
      footer: null,
      merge: null,
      revert: null,
      scope: 'myScope',
      notes: [],
      mentions: [],
      references: [],
    },
  ])
})

it('parses commits with odd scope', async () => {
  expect(
    await parseCommits([
      mockCommit({
        subject: 'feat(cplusplus): add clang-tidy. lock setuptools at 81.0.0 [] (#885)',
      }),
    ]),
  ).toEqual([
    {
      hash: '',
      type: 'feat',
      typeAppendix: undefined,
      header: 'feat(cplusplus): add clang-tidy. lock setuptools at 81.0.0 [] (#885)',
      subject: 'add clang-tidy. lock setuptools at 81.0.0 [] (#885)',
      body: null,
      footer: null,
      merge: null,
      revert: null,
      scope: 'cplusplus',
      notes: [],
      mentions: [],
      references: [],
    }
  ])
})