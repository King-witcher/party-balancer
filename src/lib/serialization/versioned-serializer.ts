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
  v: z.literal(2),
  d: z.array(
    z.tuple([
      z.string(), // Name
      z.number(), // Raing
      z.number(), // K
    ])
  ),
})

const v3schema = z.object({
  v: z.literal(3),
  d: z.array(
    z.tuple([
      z.string(), // Name
      z.number(), // Score
      z.number(), // K
      z.number(), // Date
    ])
  ),
})

const EPOCH = new Date(2026, 2, 1)
const ONE_DAY = 24 * 60 * 60 * 1000

// type SerializedV1 = z.infer<typeof v1Schema>
type SerializedV3 = z.infer<typeof v3schema>

export class VersionedSerializer implements ISerializer<PlayerRow[]> {
  private decoree: ISerializer<unknown>

  constructor(decoree: ISerializer<unknown>) {
    this.decoree = decoree
  }

  deserialize(serializedData: string): PlayerRow[] {
    const parsed = this.decoree.deserialize(serializedData)

    const parsedV3 = v3schema.safeParse(parsed)
    if (parsedV3.success) {
      return parsedV3.data.d.map(
        ([name, score, k, timestamp]): PlayerRow => ({
          name,
          score,
          k,
          date: this.toDate(timestamp),
        })
      )
    }

    const parsedV2 = v2Schema.safeParse(parsed)
    if (parsedV2.success) {
      return parsedV2.data.d.map(
        ([name, raing, k]): PlayerRow => ({
          name,
          score: raing,
          k,
          date: new Date(),
        })
      )
    }
    const parsedV1 = v1Schema.safeParse(parsed)
    if (parsedV1.success) {
      return Object.values(parsedV1.data).map((p) => ({
        ...p,
        date: new Date(),
      }))
    }
    throw new Error('No version matches serialized data')
  }

  serialize(data: PlayerRow[]): string {
    const rows = data.map((p): SerializedV3['d'][number] => [
      p.name,
      Math.round(p.score),
      Math.round(p.k),
      this.toTimestamp(p.date),
    ])

    const toSerialize: SerializedV3 = {
      v: 3,
      d: rows,
    }

    return this.decoree.serialize(toSerialize)
  }

  private toDate(timestamp: number): Date {
    return new Date(EPOCH.getTime() + timestamp * ONE_DAY)
  }

  private toTimestamp(date: Date): number {
    return Math.floor((date.getTime() - EPOCH.getTime()) / ONE_DAY)
  }
}
