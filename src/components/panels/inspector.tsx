import { ComponentProps, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Save, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Panel } from '../panel'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  score: z.coerce.number().min(0, 'Must be positive'),
  k: z.coerce.number().min(1, 'Must be at least 1'),
})

type PlayerFormData = z.output<typeof playerSchema>

type Props = Omit<ComponentProps<'div'>, 'children'> & {
  selectedPlayerId: string | null
  onPlayerDeleted?: () => void
  onPlayerUpdated?: (oldName: string, newName: string) => void
}

export function InspectorPanel({
  className,
  selectedPlayerId,
  onPlayerDeleted,
  onPlayerUpdated,
  ...rest
}: Props) {
  const playerStore = usePlayerStore()
  const selectedPlayer = selectedPlayerId
    ? playerStore.playersMap[selectedPlayerId]
    : null

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema) as never,
    defaultValues: {
      name: '',
      score: 1500,
      k: 150,
    },
  })

  useEffect(() => {
    if (selectedPlayer) {
      reset({
        name: selectedPlayer.name,
        score: Math.round(selectedPlayer.score),
        k: Math.round(selectedPlayer.k),
      })
    }
  }, [selectedPlayer, reset])

  function onSubmit(data: PlayerFormData) {
    if (!selectedPlayerId) return

    playerStore.update(selectedPlayerId, {
      name: data.name,
      score: data.score,
      k: data.k,
    })

    toast.success('Jogador atualizado com sucesso!')
    onPlayerUpdated?.(selectedPlayerId, data.name)
  }

  function handleDelete() {
    if (!selectedPlayerId) return

    playerStore.delete(selectedPlayerId)
    toast.success(`"${selectedPlayerId}" foi removido.`)
    onPlayerDeleted?.()
  }

  return (
    <Panel {...rest} className={cn('w-80 flex flex-col h-full', className)}>
      {selectedPlayer ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 h-full"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Inspecionar
          </h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="player-name">Nome</Label>
            <Input id="player-name" {...register('name')} />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="player-score">Elo</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    size={14}
                    className="text-muted-foreground cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[220px]">
                  Pontuação que representa o nível de habilidade do jogador.
                  Jogadores novos começam com 1500.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="player-score"
              type="number"
              step="1"
              {...register('score')}
            />
            {errors.score && (
              <span className="text-xs text-red-500">
                {errors.score.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="player-k">Fator K</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info
                    size={14}
                    className="text-muted-foreground cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[220px]">
                  Controla o quanto o Elo muda a cada partida. Valores altos
                  significam ajustes maiores — ideal para jogadores novos que
                  ainda estão sendo calibrados.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input id="player-k" type="number" step="1" {...register('k')} />
            {errors.k && (
              <span className="text-xs text-red-500">{errors.k.message}</span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              type="submit"
              disabled={!isDirty}
              className={cn(
                'w-full transition-all',
                isDirty &&
                  'ring-2 ring-primary/50 shadow-[0_0_12px_rgba(var(--primary),0.4)] animate-pulse'
              )}
            >
              <Save size={16} />
              Salvar
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Excluir
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
          <p className="text-sm">Selecione um jogador para inspecionar</p>
        </div>
      )}
    </Panel>
  )
}
