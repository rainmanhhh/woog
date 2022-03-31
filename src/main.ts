import yaml from 'yaml'
import * as fs from 'fs'
import rimraf from 'rimraf'
import mvn from './mvn'
import {runCmd} from './runCmd'
import {templateMap} from './templateMap'

const cwd = process.cwd()

function doClear(outDir: string) {
  return new Promise((resolve, reject) => rimraf(`${outDir}/*`, r => {
    if (r) reject(r)
    else resolve(null)
  }))
}

function tryReadFile(path: string) {
  if (fs.existsSync(path)) return fs.readFileSync(path).toString()
  else return undefined
}

function tryReadYaml(path: string) {
  const s = tryReadFile(path)
  if (s === undefined) return undefined
  else return yaml.parse(s)
}

function tryReadJson(path: string) {
  const s = tryReadFile(path)
  if (s === undefined) return undefined
  else return JSON.parse(s)
}

function readConfig(generatorDirPath: string, fileName: string): {configFile?: string, configObj?: Record<string, any>} {
  let configFile: string | undefined = generatorDirPath + '/' + fileName
  let configObj: object | undefined
  if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
    configObj = tryReadYaml(configFile)
  } else if (configFile.endsWith('.json')) {
    configObj = tryReadJson(configFile)
  } else {
    configFile = generatorDirPath + '/' + fileName + '.yaml'
    configObj = tryReadYaml(configFile)
    if (configObj === undefined) {
      configFile = generatorDirPath + '/' + fileName + '.yml'
      configObj = tryReadYaml(configFile)
    }
    if (configObj === undefined) {
      configFile = generatorDirPath + '/' + fileName + '.json'
      configObj = tryReadJson(configFile)
    }
  }
  return {configFile, configObj}
}

async function doGenerate(generatorDirName: string, outDir: string, originInput: string) {
  const inputConfig = readConfig(cwd, originInput)
  if (inputConfig.configObj === undefined)
    throw new TypeError(`input file ${originInput}.(yaml|yml|json) not found`)
  console.log('inputFile: %s', inputConfig.configFile)
  if (!fs.existsSync(generatorDirName)) fs.mkdirSync(generatorDirName)
  const generatorDirPath = `${cwd}/${generatorDirName}`
  const {configFile, configObj} = readConfig(generatorDirPath, 'config')
  const generator = configObj?.['x-generator'] ?? generatorDirName
  const template = configObj?.['x-template']
  console.log('x-generator: %s, x-template: %o', generator, template)
  let cmd = `openapi-generator-cli generate -i ${inputConfig.configFile} -o ${outDir} -g ${generator} `
  if (configObj != undefined) cmd += `-c ${configFile} `
  if (template) {
    if (typeof template === 'boolean') {
      let templateRoot = process.env.OPENAPI_TEMPLATE_ROOT || ''
      if (!templateRoot) throw new TypeError('env OPENAPI_TEMPLATE_ROOT is null')
      if (templateRoot.endsWith('/')) templateRoot = templateRoot.substring(0, templateRoot.length - 1)
      let templateDirName = templateMap[generator]
      if (templateDirName) console.log('use mapped template dir name %s for generator %s', templateDirName, generator)
      else templateDirName = generator
      cmd += `-t ${templateRoot}/${templateDirName}`
    } else if (typeof template === 'string') {
      cmd += template.startsWith('.') ? `-t ${cwd}/${template} ` : `-t ${template} `
    } else {
      throw TypeError('x-template should be boolean or string')
    }
  }
  await runCmd(cmd)
  return generator
}

async function doPackage(generator: string, outDir: string) {
  switch (generator) {
    case 'java':
    case 'spring':
    case 'kotlin-spring':
      return await mvn.run(outDir, ['clean', 'compile', 'jar:jar', 'source:jar', 'javadoc:javadoc', 'javadoc:jar'])
    default:
      console.log('nothing to package')
      return
  }
}

async function doInstall(generator: string, outDir: string) {
  switch (generator) {
    case 'java':
    case 'jaxrs-cxf-client':
    case 'spring':
    case 'kotlin-spring':
      const targetDir = `${outDir}/target`
      for (const fileName of fs.readdirSync(targetDir).filter(it => it.endsWith('.jar'))) {
        await mvn.run(outDir, ['install:install-file'], {
          file: `target/${fileName}`,
          pomFile: 'pom.xml',
          classifier: mvn.getClassifier(fileName)
        })
      }
      return
    default:
      console.log('nothing to install')
      return
  }
}

export async function main(generatorDir: string, inputFile: string = 'openapi', outDirName: string = 'out') {
  console.log('\n********** openapi code generation & installation started **********')
  const outDir = `${generatorDir}/${outDirName}`
  console.log('\n>>>>> clearing output dir [%s]...', outDir)
  await doClear(outDir)
  console.log('\n>>>>> generating code...')
  const generator = await doGenerate(generatorDir, outDir, inputFile)
  console.log('\n>>>>> packaging...')
  await doPackage(generator, outDir)
  console.log('\n>>>>> installing...')
  await doInstall(generator, outDir)
  console.log('\n********** OpenApi code generation & installation finished **********')
}
