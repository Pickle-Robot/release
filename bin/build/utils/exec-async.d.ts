import { ChildProcess, ExecOptions } from "node:child_process";
import { DeferredPromise } from "@open-draft/deferred-promise";

//#region src/utils/exec-async.d.ts
type ExecAsyncFn = {
  (command: string, options?: ExecOptions): DeferredPromiseWithIo<ExecAsyncPromisePayload>;
  mockContext(options: ExecOptions): void;
  restoreContext(): void;
  contextOptions: ExecOptions;
};
interface DeferredPromiseWithIo<T> extends DeferredPromise<T> {
  io: ChildProcess;
}
interface ExecAsyncPromisePayload {
  stdout: string;
  stderr: string;
}
declare const execAsync: ExecAsyncFn;
//#endregion
export { ExecAsyncFn, ExecAsyncPromisePayload, execAsync };