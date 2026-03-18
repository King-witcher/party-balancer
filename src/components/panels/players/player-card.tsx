import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PlayerRow } from '@/types/player'
import { CircleCheck, CircleHelp } from 'lucide-react'
import { ComponentProps } from 'react'

type Props = ComponentProps<'div'> & {
  player: PlayerRow
}

function getScoreColor(score: number): string {
  if (score > 1700) return 'text-red-500'
  if (score > 1650) return 'text-orange-400'
  if (score > 1600) return 'text-yellow-400'
  if (score < 1400) return 'text-amber-900'
  return 'text-muted-foreground'
}

export function PlayerCard({ player, ...rest }: Props) {
  const imprecise = player.k > 90

  return (
    <div
      {...rest}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('player', player.name)
        e.dataTransfer.setData('team', 'sidebar')
        e.dataTransfer.setData('index', '-1')
      }}
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-card shadow-sm cursor-grab active:cursor-grabbing hover:border-muted-foreground/30 hover:shadow transition-all select-none"
    >
      <span className="text-sm font-medium truncate">{player.name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`text-xs font-semibold tabular-nums ${getScoreColor(player.score)}`}
        >
          {Math.round(player.score)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              {imprecise ? (
                <CircleHelp size={13} className="text-amber-400" />
              ) : (
                <CircleCheck size={13} className="text-green-500" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {imprecise
              ? 'Ranking ainda impreciso — poucas partidas registradas'
              : 'Ranking calibrado'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
