import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlayers } from '@/contexts/players-context'
import { EditDialog } from './-edit-dialog'
import { Edit, RotateCcw, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const Route = createFileRoute('/players')({
  component: RouteComponent,
})

function RouteComponent() {
  const { players, addPlayer, removePlayer, resetPlayer, getList } =
    usePlayers()

  const sorted = Object.values(players).sort((a, b) => b.score - a.score)

  const [playerToEdit, setPlayerToEdit] = useState<string | null>(null)

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
    <>
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
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPlayerToEdit(player.name)}
                          >
                            <Edit size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => resetPlayer(player.name)}
                          >
                            <RotateCcw size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => removePlayer(player.name)}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
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
      <EditDialog
        playerName={playerToEdit}
        onClose={() => setPlayerToEdit(null)}
      />
    </>
  )
}
