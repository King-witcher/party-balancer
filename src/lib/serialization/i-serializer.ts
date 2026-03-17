export interface ISerializer<T> {
  serialize(data: T): string

  deserialize(serializedData: string): T
}
