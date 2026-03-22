import { IRatingSystem } from './i-rating-system'

export type DynamicKRating = {
  power: number
  kFactor: number
}

export type DynamicKSystemConfig = {
  initialPower: number
  initialK: number
  kDecayFactor: number
  leastKValue: number
  kThreshold: number
}

export class DynamicKSystem implements IRatingSystem<DynamicKRating> {
  readonly config: Readonly<DynamicKSystemConfig>

  constructor(config: DynamicKSystemConfig) {
    this.config = { ...config }
  }

  isCalibrated(rating: DynamicKRating): boolean {
    return rating.kFactor < 70
  }

  getInitialRating(): DynamicKRating {
    return {
      power: this.config.initialPower,
      kFactor: this.config.initialK,
    }
  }

  computeTeams(
    first: DynamicKRating[],
    second: DynamicKRating[],
    score: number
  ): [newFirst: DynamicKRating[], newSecond: DynamicKRating[]] {
    this.assertTeamsValid(first, second)

    const expectedScore = this.expectedTeams(first, second)
    const scoreDelta = score - expectedScore

    const computeTeam = (
      team: DynamicKRating[],
      scoreDelta: number
    ): DynamicKRating[] => {
      return team.map(
        (player): DynamicKRating => ({
          power: player.power + player.kFactor * scoreDelta,
          kFactor: Math.max(
            this.decayKFactor(player.kFactor),
            this.config.leastKValue
          ),
        })
      )
    }

    const newFirst = computeTeam(first, scoreDelta)
    const newSecond = computeTeam(second, -scoreDelta)

    return [newFirst, newSecond]
  }

  expectedTeams(first: DynamicKRating[], second: DynamicKRating[]): number {
    this.assertTeamsValid(first, second)

    const firstTeamPower =
      first.reduce((sum, p) => sum + p.power, 0) / first.length
    const secondTeamPower =
      second.reduce((sum, p) => sum + p.power, 0) / second.length

    return this.expectedScore(firstTeamPower, secondTeamPower)
  }

  private decayKFactor(currentK: number): number {
    const diff = currentK - this.config.leastKValue
    const decayAmount = diff * this.config.kDecayFactor
    const newK = currentK - decayAmount
    return Math.max(newK, this.config.leastKValue)
  }

  private assertTeamsValid(first: DynamicKRating[], second: DynamicKRating[]) {
    if (first.length === 0 || second.length === 0) {
      throw new Error('Both teams must have at least one player')
    }

    if (first.length !== second.length) {
      throw new Error('Both teams must have the same number of players')
    }
  }

  private expectedScore(playerPower: number, opponentPower: number): number {
    return 1 / (1 + 10 ** ((opponentPower - playerPower) / 400))
  }

  get initialScore(): number {
    return this.config.initialPower
  }
}
