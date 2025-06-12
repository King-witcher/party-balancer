import { useMemo } from 'react'
import { usePlayers } from '../contexts/players-context'
import type { Team } from '../hooks/use-balancer'

interface Props {
  blue: Team
  red: Team
  softBalance: () => void
  hardBalance: () => void
  isFull: boolean
}

export function WinProbabilities({
  blue,
  red,
  softBalance,
  hardBalance,
  isFull,
}: Props) {
  const { players, odds } = usePlayers()
  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  const blueOdds = useMemo(() => {
    if (blue.some((p) => p === null) || red.some((p) => p === null)) {
      return null
    }
    return odds(blue, red)
  }, [blue, red, players])

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Win Probability
      </h2>

      {blue.some((p) => p === null) || red.some((p) => p === null) ? (
        <div className="text-center text-gray-600 py-2">
          Please select all players to see win probability
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
          <div className="text-2xl font-bold text-gray-500">vs</div>

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
      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
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
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-md shadow-md hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-all duration-300"
            onClick={softBalance}
            title="Makes minimal changes to balance teams"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Soft Balance Teams
          </button>
          <button
            type="button"
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium rounded-md shadow-md hover:from-purple-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center transition-all duration-300"
            onClick={hardBalance}
            title="Optimizes team balance completely"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
            Hard Balance Teams
          </button>
        </div>
      )}
    </div>
  )
}
