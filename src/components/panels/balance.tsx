import { useMemo } from 'react'
import { Scale, Weight } from 'lucide-react'
import { usePlayers } from '@/contexts/players-context'
import { Team } from '@/hooks/use-balancer'

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
  const { playersMap: players, odds } = usePlayers()
  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  const blueOdds = useMemo(() => {
    if (blue.some((p) => p === null) || red.some((p) => p === null)) {
      return null
    }
    return odds(blue, red)
  }, [blue, red, players])

  return (
    <div className="mt-8 border w-full border-gray-200 rounded-lg p-4 shadow-sm bg-white flex flex-col gap-4">
      <h2 className="text-3xl font-normal text-center text-black">
        Balanceamento
      </h2>

      {blue.some((p) => p === null) || red.some((p) => p === null) ? (
        <div className="text-center text-gray-600 py-2">
          Selecione todos os jogadores para ver a probabilidade de vitória
        </div>
      ) : (
        <div className="flex items-center">
          {/* Blue Team */}
          <div className="w-1/2 text-center">
            <div className="font-bold text-xl text-blue-800">Blue Team</div>
            <div className="text-2xl font-bold">
              {blueOdds ? `${Math.round(blueOdds * 100)}%` : '50%'}
            </div>
          </div>

          {/* Divider */}
          <div className="text-2xl font-semibold text-gray-500">vs</div>

          {/* Red Team */}
          <div className="w-1/2 text-center">
            <div className="font-bold text-xl text-red-800">Red Team</div>
            <div className="text-2xl font-bold">
              {blueOdds ? `${Math.round((1 - blueOdds) * 100)}%` : '50%'}
            </div>
          </div>
        </div>
      )}

      {/* Probability Bar */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-red-600 transition-all duration-300"
          style={{
            width: `${blueOdds ? Math.round(blueOdds * 100) : selectedPlayers.length * 10}%`,
          }}
        />
      </div>
      {isFull && (
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            type="button"
            className="w-full gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-md shadow-md hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-all duration-300"
            onClick={softBalance}
            title="Faz alterações mínimas para balancear os times"
          >
            <Scale />
            Balancear lanes
          </button>
          <button
            type="button"
            className="w-full gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium rounded-md shadow-md hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center transition-all duration-300"
            onClick={hardBalance}
            title="Faz alterações completas para balancear os times"
          >
            <Weight />
            Balancear totalmente
          </button>
        </div>
      )}
    </div>
  )
}
