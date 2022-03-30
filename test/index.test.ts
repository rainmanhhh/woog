import {assert, test} from "vitest"
import {main} from "../src/main"
import * as fs from 'fs'

test("main", async() => {
  const generatorDir = 'openapi'
  await main(generatorDir)
  assert.equal(fs.existsSync(generatorDir + '/out/openapi.json'), true)
}, 10000)
