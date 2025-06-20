import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMatchBalancer } from '../hooks/use-balancer'
import { usePlayers } from '../contexts/players-context'
import { WinProbabilities } from '../components/win-probabilities'

export const Route = createFileRoute('/compute')({
  component: RouteComponent,
})

function RouteComponent() {
  const { blue, red, isFull, setPlayer, hardBalance, softBalance } =
    useMatchBalancer()

  const [playerToCreate, setPlayerToCreate] = useState('')

  const { players, computeResult, addPlayer } = usePlayers()

  const selectedPlayers = [...blue, ...red].filter((p) => p !== null)

  function handleChangeSelect(
    team: 'blue' | 'red',
    playerIndex: number,
    playerName: string
  ) {
    setPlayer(team, playerIndex, playerName)
  }

  function handleAddPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addPlayer(playerToCreate)
    setPlayerToCreate('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Match Setup
      </h1>

      <form className="flex gap-2 items-center mb-4" onSubmit={handleAddPlayer}>
        <input
          type="text"
          placeholder="Create new player"
          className="border border-gray-300 rounded-md p-2 flex-1"
          value={playerToCreate}
          onChange={(e) => setPlayerToCreate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Create
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border border-blue-200 p-6 rounded-lg shadow-sm bg-blue-50">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800 flex items-center">
            <span className="w-3 h-3 bg-blue-600 rounded-full mr-2" />
            Blue Team
          </h2>
          <div className="flex flex-col gap-3">
            {blue.map((player, index) => (
              <div key={`0-${index}`} className="flex items-center">
                <span className="text-gray-600 mr-2 w-6">{index + 1}.</span>
                <select
                  onChange={(e) =>
                    handleChangeSelect('blue', index, e.target.value)
                  }
                  value={player || ''}
                  data-empty={player === null}
                  className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white font-semibold data-[empty=true]:text-gray-400 data-[empty=true]:font-normal"
                >
                  <option value="">Select player...</option>
                  {Object.values(players).map((p) => {
                    if (p.name !== player && selectedPlayers.includes(p.name))
                      return null
                    return (
                      <option
                        key={p.name}
                        value={p.name}
                        className="text-black"
                      >
                        [{Math.round(p.score)}] {p.name}
                      </option>
                    )
                  })}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-red-200 p-6 rounded-lg shadow-sm bg-red-50">
          <h2 className="text-2xl font-semibold mb-4 text-red-800 flex items-center">
            <span className="w-3 h-3 bg-red-600 rounded-full mr-2" />
            Red Team
          </h2>
          <div className="flex flex-col gap-3">
            {red.map((player, index) => (
              <div key={`1-${index}`} className="flex items-center">
                <span className="text-gray-600 mr-2 w-6">{index + 1}.</span>
                <select
                  onChange={(e) =>
                    handleChangeSelect('red', index, e.target.value)
                  }
                  value={player || ''}
                  data-empty={player === null}
                  className="w-full p-2 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-400 bg-white font-semibold data-[empty=true]:text-gray-400 data-[empty=true]:font-normal"
                >
                  <option value="">Select player...</option>
                  {Object.values(players).map((p) => {
                    if (p.name !== player && selectedPlayers.includes(p.name))
                      return null
                    return (
                      <option
                        key={p.name}
                        value={p.name}
                        className="text-black"
                      >
                        [{Math.round(p.score)}] {p.name}
                      </option>
                    )
                  })}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WinProbabilities
        blue={blue}
        red={red}
        softBalance={softBalance}
        hardBalance={hardBalance}
        isFull={isFull}
      />

      <div className="flex justify-center gap-4">
        <button
          type="button"
          className={`px-6 py-3 ${
            blue.some((p) => p === null) || red.some((p) => p === null)
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 flex items-center`}
          onClick={() => computeResult(blue, red)}
          disabled={blue.some((p) => p === null) || red.some((p) => p === null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <title>icon</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Record Blue Team Win
        </button>

        <button
          type="button"
          className={`px-6 py-3 ${
            red.some((p) => p === null) || blue.some((p) => p === null)
              ? 'bg-red-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          } text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-opacity-50 flex items-center`}
          onClick={() => computeResult(red, blue)}
          disabled={red.some((p) => p === null) || blue.some((p) => p === null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <title>icon</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Record Red Team Win
        </button>
      </div>
    </div>
  )
}
