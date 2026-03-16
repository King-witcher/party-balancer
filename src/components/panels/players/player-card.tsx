import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Player } from '@/types/player'
import { CircleCheck, CircleHelp } from 'lucide-react'
import { ComponentProps } from 'react'

type Props = ComponentProps<'div'> & {
  player: Player
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
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow transition-all select-none"
    >
      <span className="text-sm font-medium truncate">{player.name}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-500 font-semibold tabular-nums">
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
