import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { PlayersMap } from '@/contexts/players-context'
import { usePlayers } from '@/contexts/players-context'
import { useMutation } from '@tanstack/react-query'
import { Copy, Download, Search, Upload, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PlayerCard } from './player-card'

interface Props {
  players: PlayersMap
  selectedPlayers: string[]
  onDropFromTeam: (
    playerName: string,
    sourceTeam: 'blue' | 'red',
    sourceIndex: number
  ) => void
  onSelectPlayer: (playerId: string) => void
}

export function PlayersPanel({
  players,
  selectedPlayers,
  onDropFromTeam,
  onSelectPlayer,
}: Props) {
  const { importJSON, exportJSON, getList, addPlayer } = usePlayers()
  const [isDragOver, setIsDragOver] = useState(false)
  const [search, setSearch] = useState('')

  const importMutation = useMutation({
    mutationKey: ['import-players'],
    mutationFn: importJSON,
    onSuccess: () => {
      toast.success('Jogadores importados com sucesso!', { closeButton: true })
    },
    onError: (error: string) => {
      toast.error(`Falha ao importar jogadores: ${error}`, {
        closeButton: true,
      })
    },
  })

  function handleAddPlayer() {
    if (!search.trim()) return
    addPlayer(search.trim())
    toast.success(`Jogador "${search.trim()}" adicionado!`, {
      closeButton: true,
    })
    setSearch('')
  }

  function copyRankings() {
    const rankings = getList()
    navigator.clipboard.writeText(rankings)
    toast.success('Rankings copiados!', { closeButton: true })
  }

  const availablePlayers = useMemo(() => {
    const filtered = Object.values(players)
      .filter((p) => !selectedPlayers.includes(p.name))
      .sort((a, b) => {
        const aImprecise = a.k > 90 ? 1 : 0
        const bImprecise = b.k > 90 ? 1 : 0
        if (aImprecise !== bImprecise) return aImprecise - bImprecise
        return b.score - a.score
      })

    if (!search.trim()) return filtered
    const query = search.toLowerCase()
    return filtered.filter((p) => p.name.toLowerCase().includes(query))
  }, [players, selectedPlayers, search])

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)

    const droppedTeam = e.dataTransfer.getData('team')
    if (droppedTeam === 'sidebar') return

    const playerName = e.dataTransfer.getData('player')
    if (!playerName) return

    const sourceIndex = Number(e.dataTransfer.getData('index'))
    onDropFromTeam(playerName, droppedTeam as 'blue' | 'red', sourceIndex)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-dragover={isDragOver}
      className="flex flex-col h-full gap-2 p-4 rounded-xl border border-border bg-card shadow-md w-[320px] transition-colors data-[dragover=true]:border-primary data-[dragover=true]:bg-primary/5"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Jogadores
        </h3>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => importMutation.mutate()}
              >
                <Download size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Importar jogadores</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={exportJSON}
              >
                <Upload size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar jogadores</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyRankings}
              >
                <Copy size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar rankings</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={!search.trim()}
              onClick={handleAddPlayer}
            >
              <UserPlus size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Adicionar jogador</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
        {availablePlayers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {Object.keys(players).length === 0
              ? 'No players created yet'
              : search.trim()
                ? 'No players match your search'
                : 'All players are in the match'}
          </p>
        ) : (
          availablePlayers.map((player) => (
            <PlayerCard
              key={player.name}
              player={player}
              onClick={() => onSelectPlayer(player.name)}
            />
          ))
        )}
      </div>
    </div>
  )
}
