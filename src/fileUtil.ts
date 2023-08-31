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
  async read(path: string, encoding: BufferEncoding = 'utf-8') {
    return new Promise<string | undefined>((resolve, reject) => {
      fs.stat(path, (checkErr, stats) => {
        if (checkErr) reject(checkErr)
        else {
          if (!stats.isFile()) resolve(undefined)
          else fs.readFile(path, (readErr, data) => {
            if (readErr) reject(readErr)
            resolve(data.toString(encoding))
          })
        }
      })
    })
  },
  async readYaml(path: string) {
    const s = await fileUtil.read(path)
    if (s) return yaml.parse(s)
    else return undefined
  },
  async readJson(path: string) {
    const s = await fileUtil.read(path)
    if (s) return JSON.parse(s)
    else return undefined
  },
  /**
   *
   * @param generatorDirPath
   * @param fileName
   */
  async readConfig(generatorDirPath: string, fileName: string): Promise<WoogConfig> {
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
