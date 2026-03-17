import { useMemo } from 'react'
import { RulerDimensionLine, Scale, Shuffle } from 'lucide-react'
import { Team } from '@/hooks/use-balancer'
import { Panel } from '../panel'
import { Button } from '../ui/button'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { useRatingSystem } from '@/contexts/rating-system-context'
import { DynamicKRating } from '@/lib/rating-system/dynamic-k-elo-system'

interface Props {
  blue: Team
  red: Team
  softBalance: () => void
  hardBalance: () => void
  isFull: boolean
}

export function BalancePanel({
  blue,
  red,
  softBalance,
  hardBalance,
  isFull,
}: Props) {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()

  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  const blueOdds = useMemo(() => {
    if (blue.some((p) => p === null) || red.some((p) => p === null)) {
      return null
    }
    const blueRanks = blue.map((id): DynamicKRating => {
      const player = playerStore.playersMap[id!]
      return {
        power: player.score,
        kFactor: player.k,
      }
    })
    const redRanks = red.map((id): DynamicKRating => {
      const player = playerStore.playersMap[id!]
      return {
        power: player.score,
        kFactor: player.k,
      }
    })
    return ratingSystem.expectedTeams(blueRanks, redRanks)
  }, [blue, red, ratingSystem])

  return (
    <Panel className="w-full flex flex-col gap-4">
      <h2 className="text-3xl font-normal text-center text-foreground">
        Balanceamento
      </h2>

      {blue.some((p) => p === null) || red.some((p) => p === null) ? (
        <div className="text-center text-muted-foreground py-2">
          Selecione todos os jogadores para ver a probabilidade de vitória
        </div>
      ) : (
        <div className="flex items-center">
          {/* Blue Team */}
          <div className="w-1/2 text-center">
            <div className="font-bold text-xl text-blue-400">Blue Team</div>
            <div className="text-2xl font-bold">
              {blueOdds ? `${Math.round(blueOdds * 100)}%` : '50%'}
            </div>
          </div>

          {/* Divider */}
          <div className="text-2xl font-semibold text-muted-foreground">vs</div>

          {/* Red Team */}
          <div className="w-1/2 text-center">
            <div className="font-bold text-xl text-red-400">Red Team</div>
            <div className="text-2xl font-bold">
              {blueOdds ? `${Math.round((1 - blueOdds) * 100)}%` : '50%'}
            </div>
          </div>
        </div>
      )}

      {/* Probability Bar */}
      <div className="h-4 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-red-600 transition-all duration-300"
          style={{
            width: `${blueOdds ? Math.round(blueOdds * 100) : selectedPlayers.length * 10}%`,
          }}
        />
      </div>
      {isFull && (
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* <button
            type="button"
            className="w-full gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-md shadow-md hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-all duration-300"
            onClick={softBalance}
            title="Faz alterações mínimas para balancear os times"
          >
            <Scale />
            Balancear lanes
          </button> */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
          >
            <Scale />
            Balancear
          </Button>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
          >
            <Shuffle />
            Sortear
          </Button>
          <Button
            size="lg"
            className="bg-gradient-to-r ml-auto from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
          >
            <RulerDimensionLine />
            Computar resultado
          </Button>
          {/* <button
            type="button"
            className="w-full gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium rounded-md shadow-md hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center transition-all duration-300"
            onClick={hardBalance}
            title="Faz alterações completas para balancear os times"
          >
            <Weight />
            Balancear totalmente
          </button> */}
        </div>
      )}
    </Panel>
  )
}
