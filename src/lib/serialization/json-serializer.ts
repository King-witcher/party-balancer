import z from 'zod'
import { ISerializer } from './i-serializer'

type JsonSerializerConfig<T> = {
  prettyPrint?: boolean
  schema?: z.ZodType<T>
}

export class JsonSerializer<T = unknown> implements ISerializer<T> {
  private readonly prettyPrint: boolean
  private readonly schema?: z.ZodType<T>

  constructor(config: JsonSerializerConfig<T> = {}) {
    this.prettyPrint = config.prettyPrint || false
    this.schema = config.schema
  }

  deserialize(serializedData: string): T {
    const parsed = JSON.parse(serializedData)
    return this.schema ? this.schema.parse(parsed) : parsed
  }

  serialize(data: T): string {
    return JSON.stringify(data, null, this.prettyPrint ? 4 : 0)
  }
}
