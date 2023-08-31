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
  async exists(path: string) {
    return new Promise<boolean>(resolve => {
      fs.access(path, (err) => resolve(!err))
    })
  },
  async read(path: string, encoding: BufferEncoding = 'utf-8') {
    const exists = await fileUtil.exists(path)
    if (!exists) return ''
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) reject(err)
        resolve(data.toString(encoding))
      })
    })
  },
  /**
   *
   * @param configDir path of config dir. if reading config for generator, it should be generator dir
   * @param inputFile path of config file. could be local file path or url
   */
  async readConfig(configDir: string, inputFile: string): Promise<WoogConfig> {
    let configFile = ''
    let configText = ''
    if (inputFile.startsWith('http://') || inputFile.startsWith('https://')) {
      const res = await fetch(inputFile)
      configText = await res.text()
    } else {
      configFile = configDir + '/' + inputFile
      if (!(configFile.endsWith('yaml') || configFile.endsWith('yml') || configFile.endsWith('json'))) {
        if (await fileUtil.exists(configFile + '.yaml')) configFile += '.yaml'
        else if (await fileUtil.exists(configFile + '.yml')) configFile += '.yml'
        else if (await fileUtil.exists(configFile + '.json')) configFile += '.json'
      }
      configText = await fileUtil.read(configFile)
    }
    console.debug('configText: ', configText)
    let configObj: object | undefined
    if (configText) {
      try {
        configObj = JSON.parse(configText)
      } catch (e) {
        console.debug('configText is not json')
      }
      configObj = yaml.parse(configText)
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
