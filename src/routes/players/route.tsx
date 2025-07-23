import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePlayers } from '@/contexts/players-context'
import { EditDialog } from './-edit-dialog'
import {
  Copy,
  Download,
  Edit,
  Plus,
  RotateCcw,
  TrashIcon,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/page-container'

export const Route = createFileRoute('/players')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    players,
    addPlayer,
    removePlayer,
    resetPlayer,
    getList,
    importJSON,
    exportJSON,
  } = usePlayers()

  const importMutation = useMutation({
    mutationKey: ['import-players'],
    mutationFn: importJSON,
    onSuccess: () => {
      toast.success('Players imported successfully!', {
        closeButton: true,
      })
    },
    onError: (error: string) => {
      toast.error(`Failed to import players: ${error}`, {
        closeButton: true,
      })
    },
  })

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
      <PageContainer>
        <form onSubmit={handleSubmit} className="flex gap-3 justify-end">
          <Input
            type="text"
            placeholder="Type a new player name"
            value={newPlayerName}
            onChange={handleChangeNewPlayerName}
            className="w-70"
            required
          />
          <Button type="submit">
            <Plus /> Add
          </Button>
        </form>
        <div className="mt-6 overflow-x-auto rounded-lg shadow">
          <table className="w-full divide-y divide-gray-200">
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
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-primary"
                    onClick={() => importMutation.mutate()}
                  >
                    <Download />
                    Import
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-primary"
                    onClick={exportJSON}
                  >
                    <Upload />
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-primary"
                    onClick={copyRankings}
                  >
                    <Copy />
                    Copy Rankings
                  </Button>
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
                    <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-900">
                      {player.name}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                      {Math.round(player.score)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                      {Math.round(player.k)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right">
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
        </div>
      </PageContainer>
      <EditDialog
        playerName={playerToEdit}
        onClose={() => setPlayerToEdit(null)}
      />
    </>
  )
}
