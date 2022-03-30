#!node

import {main} from './main'

const generatorDir = process.argv[2]
if (!generatorDir) {
  console.log('usage: woog <generatorDirName> [inputFileName=openapi] [outputDirName=out]')
  process.exit(1)
}
main(
  generatorDir
    .replace(/\\/g, '/') // replace windows separator `\` with `/`
    .replace(/^\.\//, '') // remove starting `./`
    .replace(/\/$/, ''), // remove ending `/`
  process.argv[3],
  process.argv[4]
).catch(
  e => console.error(e)
)
