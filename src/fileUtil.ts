import fs from 'fs'
import yaml from 'yaml'

export interface WoogConfig {
  /**
   * eg.: "/foo/bar/openapi.yml"
   */
  configFile: string
  /**
   * should be OpenAPIObject
   */
  configObj?: Record<string, any>
}

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
  /**
   *
   * @param generatorDirPath
   * @param fileName
   */
  readConfig(generatorDirPath: string, fileName: string): WoogConfig {
    let configFile: string = generatorDirPath + '/' + fileName
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
  },
  writeConfig(filePath: string, configObj: Record<string, any>) {
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      fs.writeFileSync(filePath, yaml.stringify(configObj))
    } else if (filePath.endsWith('.json')) {
      fs.writeFileSync(filePath, JSON.stringify(configObj))
    } else throw new TypeError(`invalid config file path: ${filePath}`)
  }
}
