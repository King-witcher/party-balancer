import { ComponentProps } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Save, Info, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Panel } from '../panel'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { format } from 'date-fns'
import { PlayerRow } from '@/types/player'
import { toast } from 'sonner'

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  score: z.coerce.number().min(0, 'Must be positive'),
  k: z.coerce.number().min(1, 'Must be at least 1'),
  date: z.date().default(new Date()),
})

type PlayerFormData = z.output<typeof playerSchema>

type Props = Omit<ComponentProps<'div'>, 'children'> & {
  selectedPlayerId: string | null
}

export function InspectorPanel({
  className,
  selectedPlayerId,
  ...rest
}: Props) {
  const playerStore = usePlayerStore()
  const selectedPlayer = selectedPlayerId
    ? playerStore.playersMap[selectedPlayerId]
    : null

  function handleUpdate(data: PlayerRow) {
    if (selectedPlayerId === null) return

    playerStore.update(selectedPlayerId, data)
    toast.success('Player updated successfully')
  }

  function handleDelete(name: string) {
    if (selectedPlayerId === null) return

    playerStore.delete(selectedPlayerId)
    toast.success(`Player "${name}" deleted successfully`)
  }

  return (
    <Panel {...rest} className={cn('w-80 flex flex-col h-full', className)}>
      {selectedPlayer ? (
        <InspectorPanelInner
          key={selectedPlayerId}
          selectedPlayer={selectedPlayer}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
          <p className="text-sm">Selecione um jogador para inspecionar</p>
        </div>
      )}
    </Panel>
  )
}

type InnerProps = {
  selectedPlayer: PlayerRow
  onUpdate: (data: PlayerRow) => void
  onDelete: (name: string) => void
}

function InspectorPanelInner({
  selectedPlayer,
  onUpdate,
  onDelete,
}: InnerProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema) as never,
    defaultValues: {
      name: selectedPlayer.name,
      score: selectedPlayer.score,
      k: selectedPlayer.k,
      date: selectedPlayer.date,
    },
  })

  function onSubmit(data: PlayerFormData) {
    onUpdate({
      ...selectedPlayer,
      name: data.name,
      score: data.score,
      k: data.k,
      date: data.date,
    })
  }

  function handleDelete() {
    onDelete(selectedPlayer.name)
  }

  return (
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
          <span className="text-xs text-red-500">{errors.name.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="player-score">Elo</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={14} className="text-muted-foreground cursor-help" />
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
          <span className="text-xs text-red-500">{errors.score.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="player-k">Fator K</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={14} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px]">
              Controla o quanto o Elo muda a cada partida. Valores altos
              significam ajustes maiores — ideal para jogadores novos que ainda
              estão sendo calibrados.
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="player-k" type="number" step="1" {...register('k')} />
        {errors.k && (
          <span className="text-xs text-red-500">{errors.k.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="player-date">Data</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={14} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>

            <TooltipContent side="right" className="max-w-[220px]">
              Data da última atualização do rating do jogador.
            </TooltipContent>
          </Tooltip>
        </div>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  // data-empty={!field.value}
                  className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                  <CalendarIcon />
                  {format(field.value, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.date && (
          <span className="text-xs text-red-500">{errors.date.message}</span>
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
  )
}
