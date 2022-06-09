import fs from 'fs'
import yaml from 'yaml'

export const fileUtil = {
  read(path: string) {
    if (fs.existsSync(path)) return fs.readFileSync(path).toString()
    else return undefined
  },
  readYaml(path: string) {
    const s = fileUtil.read(path)
    if (s === undefined) return undefined
    else return yaml.parse(s)
  },
  readJson(path: string) {
    const s = fileUtil.read(path)
    if (s === undefined) return undefined
    else return JSON.parse(s)
  },
  readConfig(generatorDirPath: string, fileName: string): {
    configFile?: string
    configObj?: Record<string, any>
  } {
    let configFile: string | undefined = generatorDirPath + '/' + fileName
    let configObj: object | undefined
    if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
      configObj = fileUtil.readYaml(configFile)
    } else if (configFile.endsWith('.json')) {
      configObj = fileUtil.readJson(configFile)
    } else {
      configFile = generatorDirPath + '/' + fileName + '.yaml'
      configObj = fileUtil.readYaml(configFile)
      if (configObj === undefined) {
        configFile = generatorDirPath + '/' + fileName + '.yml'
        configObj = fileUtil.readYaml(configFile)
      }
      if (configObj === undefined) {
        configFile = generatorDirPath + '/' + fileName + '.json'
        configObj = fileUtil.readJson(configFile)
      }
    }
    return {configFile, configObj}
  }
}
