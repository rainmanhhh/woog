import {exec} from 'child_process'

export function runCmd(cmd: string, workDir = process.cwd()) {
  return new Promise<void>((resolve, reject) => {
    exec(cmd, {
      cwd: workDir
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('!!!!!!!!!! runCmd [%s] failed: ', cmd, error)
        console.error(stderr)
        reject()
      } else {
        console.log(stdout)
        resolve()
      }
    })
  })
}
