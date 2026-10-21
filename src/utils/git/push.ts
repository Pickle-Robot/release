import { execAsync } from '#/src/utils/exec-async.js'

/**
 * Push the given branch and tag to "origin" in a single atomic push,
 * so the remote either receives both or neither.
 */
export async function push(branch: string, tag: string): Promise<void> {
  await execAsync(`git push --atomic origin ${branch} refs/tags/${tag}`)
}
