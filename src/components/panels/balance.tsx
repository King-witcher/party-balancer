import { useMemo } from 'react'
import { RulerDimensionLine, Scale, Shuffle } from 'lucide-react'
import { Team } from '@/hooks/use-balancer'
import { Panel } from '../panel'
import { Button } from '../ui/button'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { useRatingSystem } from '@/contexts/rating-system-context'
import { DynamicKRating } from '@/lib/rating-system/dynamic-k-elo-system'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useComputeResult } from '@/hooks/use-ranks-computer'
import { PopoverClose } from '@radix-ui/react-popover'

interface Props {
  blue: Team
  red: Team
  softBalance: () => void
  hardBalance: () => void
  shuffle: () => void
  isFull: boolean
}

export function BalancePanel({
  blue,
  red,
  softBalance,
  hardBalance,
  shuffle,
  isFull,
}: Props) {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()

  const computeResult = useComputeResult()

  function handleComputeResult(winner: 'blue' | 'red') {
    if (winner === 'blue') {
      computeResult(blue, red)
    } else {
      computeResult(red, blue)
    }
  }

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
  }, [blue, red, ratingSystem, playerStore.playersMap])

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Scale />
                Balancear
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
              <h3 className="text-md font-medium text-center mb-1">
                Preservar as lanes escolhidas?
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={softBalance}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                >
                  Preservar
                </Button>
                <Button
                  onClick={hardBalance}
                  className="flex-1 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-800 hover:to-orange-700 text-white"
                >
                  Ignorar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="lg"
            onClick={shuffle}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
          >
            <Shuffle />
            Sortear
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r ml-auto from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white"
              >
                <RulerDimensionLine />
                Computar resultado
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2">
              <h3 className="text-md font-medium text-center mb-1">
                Escolha o vencedor
              </h3>
              <div className="flex gap-2">
                <PopoverClose asChild>
                  <Button
                    onClick={() => handleComputeResult('blue')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                  >
                    Ordem
                  </Button>
                </PopoverClose>

                <PopoverClose asChild>
                  <Button
                    onClick={() => handleComputeResult('red')}
                    className="flex-1 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-800 hover:to-orange-700 text-white"
                  >
                    Caos
                  </Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Panel>
  )
}
