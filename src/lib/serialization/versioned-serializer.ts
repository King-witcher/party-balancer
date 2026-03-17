import { PlayerRow } from '@/types/player'
import { ISerializer } from './i-serializer'
import z from 'zod'

const playerSchema = z.object({
  name: z.string(),
  k: z.number(),
  score: z.number(),
})

const v1Schema = z.record(z.string(), playerSchema).refine((record) => {
  return Object.entries(record).every(([key, value]) => key === value.name)
}, 'Player names must be equal to their keys')

const v2Schema = z.object({
  version: z.literal(2),
  players: z.array(playerSchema),
})

export class VersionedSerializer implements ISerializer<PlayerRow[]> {
  private decoree: ISerializer<unknown>

  constructor(decoree: ISerializer<unknown>) {
    this.decoree = decoree
  }

  deserialize(serializedData: string): PlayerRow[] {
    const parsed = this.decoree.deserialize(serializedData)
    const parsedV2 = v2Schema.safeParse(parsed)
    if (parsedV2.success) {
      return parsedV2.data.players
    }
    const parsedV1 = v1Schema.safeParse(parsed)
    if (parsedV1.success) {
      return Object.values(parsedV1.data)
    }
    throw new Error('No version matches serialized data')
  }

  serialize(data: PlayerRow[]): string {
    const toSerialize = {
      version: 2,
      players: data,
    }
    return this.decoree.serialize(toSerialize)
  }
}
