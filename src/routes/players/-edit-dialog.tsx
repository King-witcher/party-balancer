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
import { usePlayers } from '@/contexts/players-context'
import { useState } from 'react'

interface Props {
  playerName: string | null
  onClose?: () => void
}

export function EditDialog({ playerName, onClose }: Props) {
  const { players, updatePlayer } = usePlayers()
  const playerToEdit = playerName ? players[playerName] : null

  const [newName, setNewName] = useState<string | null>(null)
  const [newScore, setNewScore] = useState<number | null>(null)
  const [newKFactor, setNewKFactor] = useState<number | null>(null)

  function clear() {
    setNewName(null)
    setNewScore(null)
    setNewKFactor(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!playerName) return

    updatePlayer(playerName, {
      name: newName ?? playerToEdit?.name!,
      score: newScore ?? playerToEdit?.score!,
      k: newKFactor ?? playerToEdit?.k!,
    })

    clear()
    onClose?.()
  }

  function handleClose() {
    clear()
    onClose?.()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) handleClose()
  }

  return (
    <Dialog open={!!playerName} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Avoid manually calibrating rating params as much as possible.
            </DialogDescription>
          </DialogHeader>
          <Input
            key={playerName}
            value={newName ?? playerToEdit?.name}
            placeholder="Player Name"
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            type="number"
            value={newScore ?? playerToEdit?.score}
            placeholder="Player Score"
            onChange={(e) => setNewScore(Number(e.target.value))}
            required
          />
          <Input
            type="number"
            value={newKFactor ?? playerToEdit?.k}
            placeholder="Player K-Factor"
            onChange={(e) => setNewKFactor(Number(e.target.value))}
            required
          />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
