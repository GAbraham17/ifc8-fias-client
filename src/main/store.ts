import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

interface StoreOptions {
  configName: string
  defaults: Record<string, any>
}

class Store {
  private path: string
  private data: Record<string, any>

  constructor(opts: StoreOptions) {
    const userDataPath = app.getPath('userData')
    console.log(userDataPath);
    this.path = path.join(userDataPath, `${opts.configName}.json`)
    this.data = this.parseDataFile(this.path, opts.defaults)
  }

  get(key: string): any {
    return this.data[key]
  }

  set(key: string, val: any): void {
    this.data[key] = val
    console.log(key, val);
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }

  private parseDataFile(filePath: string, defaults: Record<string, any>): Record<string, any> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return {
        ...defaults,
        ...data
      }
    } catch (error) {
      return defaults
    }
  }
}

export default Store
