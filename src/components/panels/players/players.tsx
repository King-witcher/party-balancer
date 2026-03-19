import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation } from '@tanstack/react-query'
import { Copy, Download, Scale, Search, Upload, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PlayerCard } from './player-card'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { ISerializer } from '@/lib/serialization'
import { PlayerRow } from '@/types/player'
import { useRatingSystem } from '@/contexts/rating-system-context'

interface Props {
  selectedPlayers: string[]
  onDropFromTeam: (
    playerName: string,
    sourceTeam: 'blue' | 'red',
    sourceIndex: number
  ) => void
  onSelectPlayer: (playerId: string) => void
  serializer: ISerializer<PlayerRow[]>
}

async function importFile(ext: string): Promise<string> {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = ext
  input.multiple = false

  return new Promise((resolve, reject) => {
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      const text = await file.text()
      resolve(text)
    }

    input.onabort = () => {
      reject(new Error('File selection aborted'))
    }

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function PlayersPanel({
  selectedPlayers,
  onDropFromTeam,
  onSelectPlayer,
  serializer,
}: Props) {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()
  const [isDragOver, setIsDragOver] = useState(false)
  const [search, setSearch] = useState('')

  const importMutation = useMutation({
    mutationKey: ['import-players'],
    async mutationFn(serializer: ISerializer<PlayerRow[]>) {
      const file = await importFile('.json')
      const importedPlayers = serializer.deserialize(file)
      playerStore.import(importedPlayers)
    },
    onSuccess: () => {
      toast.success('Jogadores importados com sucesso!', { closeButton: true })
    },
    onError: (error: string) => {
      toast.error(`Falha ao importar jogadores: ${error}`, {
        closeButton: true,
      })
    },
  })

  function exportPlayers() {
    const data = serializer.serialize(playerStore.playersList)
    downloadFile('players.json', data)
  }

  function handleAddPlayer() {
    if (!search.trim()) return
    playerStore.create({ name: search.trim(), score: 0, k: 0 })
    toast.success(`Jogador "${search.trim()}" adicionado!`, {
      closeButton: true,
    })
    setSearch('')
  }

  function normalize() {
    const averageScore =
      playerStore.playersList.reduce((sum, p) => sum + p.score, 0) /
      playerStore.playersList.length

    const diff = averageScore - ratingSystem.initialScore
    const normalized = playerStore.playersList.map((p) => ({
      ...p,
      score: p.score - diff,
    }))

    playerStore.import(normalized)
    toast.success(
      `Pontuações normalizadas. Diferença aplicada: ${diff.toFixed(2)}.`,
      {
        closeButton: true,
      }
    )
  }

  function copyRanking() {
    const unsorted = playerStore.playersList
    const sorted = unsorted.sort((a, b) => b.score - a.score)
    const lines = sorted.map(
      (current, index) =>
        `#${index + 1}: ${current.name} - ${Math.round(current.score)}${current.k > 90 ? ' (?)' : ''}`
    )
    const text = lines.join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Rankings copiados!', { closeButton: true })
  }

  const availablePlayers = useMemo(() => {
    const filtered = playerStore.playersList
      .filter((p) => !selectedPlayers.includes(p.name))
      .sort((a, b) => b.score - a.score)

    if (!search.trim()) return filtered
    const query = search.toLowerCase()
    return filtered.filter((p) => p.name.toLowerCase().includes(query))
  }, [playerStore.playersList, selectedPlayers, search])

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
                onClick={normalize}
              >
                <Scale size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Normalizar as pontuações para manter a média em 1500
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => importMutation.mutate(serializer)}
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
                onClick={exportPlayers}
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
                onClick={copyRanking}
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
            {playerStore.playersList.length === 0
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
