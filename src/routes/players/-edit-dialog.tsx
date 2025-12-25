import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Player, usePlayers } from '@/contexts/players-context'
import { useState } from 'react'

interface Props {
  playerName: string | null
  onClose?: () => void
}

export function EditDialog({ playerName, onClose }: Props) {
  const { players, updatePlayer } = usePlayers()
  const playerToEdit = playerName ? players[playerName] : null

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose?.()
  }

  function handleSubmit(player: Player) {
    updatePlayer(playerName!, player)
    onClose?.()
  }

  return (
    <Dialog open={!!playerName} onOpenChange={handleOpenChange}>
      <DialogContent>
        {/* <form className="flex flex-col gap-4" onSubmit={handleSubmit}> */}
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Avoid manually calibrating rating params as much as possible.
          </DialogDescription>
        </DialogHeader>
        <EditDialogInner initValue={playerToEdit!} onChange={handleSubmit} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
        {/* </form> */}
      </DialogContent>
    </Dialog>
  )
}

type EditDialogInnerProps = {
  initValue?: Player
  onChange?: (data: Player) => void
}

function EditDialogInner(props: EditDialogInnerProps) {
  const { initValue, onChange } = props

  const [playerName, setPlayerName] = useState(initValue?.name ?? '')
  const [playerScore, setPlayerScore] = useState(initValue?.score ?? 0)
  const [playerKFactor, setPlayerKFactor] = useState(initValue?.k ?? 0)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!playerName) return

    onChange?.({
      name: playerName,
      score: playerScore,
      k: playerKFactor,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={playerName}
          placeholder="Player Name"
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="score">Score</Label>
        <Input
          type="number"
          id="score"
          value={playerScore}
          placeholder="Player Score"
          onChange={(e) => setPlayerScore(Number(e.target.value))}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="k-factor">K-Factor</Label>
        <Input
          type="number"
          id="k-factor"
          value={playerKFactor}
          placeholder="Player K-Factor"
          onChange={(e) => setPlayerKFactor(Number(e.target.value))}
          required
        />
      </div>
    </form>
  )
}
