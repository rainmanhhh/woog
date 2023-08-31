import * as fs from 'fs'
import {rimraf} from 'rimraf'
import mvn from './mvn'
import {runCmd} from './runCmd'
import {templateMap} from './templateMap'
import {fileUtil} from './fileUtil'
import {objectUtil} from './objectUtil'
import {OpenAPIObject} from 'openapi3-ts/oas30'

const cwd = process.cwd()

function doClear(outDir: string) {
  console.log('\n>>>>> clearing output dir [%s]...', outDir)
  return rimraf(`${outDir}/*`)
}

/**
 * sort paths and schemas
 * @param inputFile
 * @param openAPIObject
 */
function sortInput(inputFile: string, openAPIObject: OpenAPIObject) {
  let orderChanged = false
  const originPaths = openAPIObject.paths
  const newPaths = objectUtil.sortByKey(originPaths)
  if (Object.keys(originPaths).toString() !== Object.keys(newPaths).toString()) {
    openAPIObject.paths = newPaths
    orderChanged = true
  }
  if (openAPIObject.components?.schemas) {
    const originModels = openAPIObject.components.schemas
    const newModels = objectUtil.sortByKey(originModels)
    if (Object.keys(originModels).toString() !== Object.keys(newModels).toString()) {
      openAPIObject.components.schemas = newModels
      orderChanged = true
    }
  }
  if (orderChanged) fileUtil.writeConfig(inputFile, openAPIObject)
}

async function doGenerate(generatorDirName: string, outDir: string, originInput: string) {
  console.log('\n>>>>> generating code...')
  // read and check input
  const input = await fileUtil.readConfig(cwd, originInput)
  const openAPIObject = input.configObj as OpenAPIObject | undefined
  if (openAPIObject === undefined)
    throw new TypeError(`input file ${originInput}.(yaml|yml|json) not found`)
  const inputFile = input.configFile
  console.log('inputFile: %s', inputFile)
  // read config
  if (!fs.existsSync(generatorDirName)) fs.mkdirSync(generatorDirName)
  const generatorDirPath = `${cwd}/${generatorDirName}`
  const {configFile, configObj} = await fileUtil.readConfig(generatorDirPath, 'config')
  const generator = configObj?.['x-generator'] ?? generatorDirName
  if ((generator === 'openapi' || generator === 'openapi-yaml') && !(originInput.startsWith('http://') || originInput.startsWith('https://')))
    sortInput(inputFile, openAPIObject)
  const template = configObj?.['x-template']
  console.log('x-generator: %s, x-template: %o', generator, template)
  let cmd = `openapi-generator-cli generate -i ${inputFile} -o ${outDir} -g ${generator} `
  if (configObj != undefined) cmd += `-c ${configFile} `
  // add template related param
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
  // send generate command to shell
  await runCmd(cmd)
  return generator
}

async function doPackage(generator: string, outDir: string) {
  console.log('\n>>>>> packaging...')
  switch (generator) {
    case 'java':
    case 'jaxrs-cxf-client':
    case 'spring':
    case 'kotlin-spring':
      return await mvn.run(outDir, ['clean', 'compile', 'jar:jar', 'source:jar', 'javadoc:javadoc', 'javadoc:jar'])
    default:
      console.log('nothing to package')
      return
  }
}

async function doInstall(generator: string, outDir: string) {
  console.log('\n>>>>> installing...')
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
  await doClear(outDir)
  const generator = await doGenerate(generatorDir, outDir, inputFile)
  await doPackage(generator, outDir)
  await doInstall(generator, outDir)
  console.log('\n********** OpenApi code generation & installation finished **********')
}
