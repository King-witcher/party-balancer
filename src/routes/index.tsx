import { createFileRoute } from '@tanstack/react-router'
import { usePlayerbase } from '../hooks/use-playerbase'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { players, addPlayer, removePlayer, resetPlayer, getList } =
    usePlayerbase()

  const sorted = Object.values(players).sort((a, b) => b.score - a.score)

  const [newPlayerName, setNewPlayerName] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addPlayer(newPlayerName)
    setNewPlayerName('')
  }

  function handleChangeNewPlayerName(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setNewPlayerName(event.target.value)
  }

  function copyRankings() {
    const rankings = getList()
    navigator.clipboard.writeText(rankings)
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={handleChangeNewPlayerName}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Add Player
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                K-Factor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((player) => {
              return (
                <tr
                  key={player.name}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {Math.round(player.score)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {Math.round(player.k)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex gap-2 items-end justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        onClick={() => removePlayer(player.name)}
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        onClick={() => resetPlayer(player.name)}
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200 w-full flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            onClick={copyRankings}
          >
            Copy Rankings
          </button>
        </div>
      </div>
    </div>
  )
}
