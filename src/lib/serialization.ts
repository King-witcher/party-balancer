import type { PlayerSet } from '@/contexts/players-context'

export function exportPlayers(players: PlayerSet) {
  const blob = new Blob([JSON.stringify(players)], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'players.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// biome-ignore lint/suspicious/noExplicitAny: Type testing
function validatePlayerSet(data: any): data is PlayerSet {
  if (typeof data !== 'object' || data === null) return false
  for (const name in data) {
    const player = data[name]
    if (
      typeof player !== 'object' ||
      typeof player.name !== 'string' ||
      typeof player.k !== 'number' ||
      typeof player.score !== 'number'
    ) {
      return false
    }

    if (player.name !== name) {
      return false
    }
  }
  return true
}

export async function importPlayers(): Promise<PlayerSet> {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.multiple = false
  return new Promise((resolve, reject) => {
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        reject('file-not-selected')
        return
      }
      const text = await file.text()
      try {
        const players = JSON.parse(text)
        if (!validatePlayerSet(players)) {
          reject('invalid-json-format')
          return
        }
        resolve(players)
      } catch (error) {
        reject('parse-error')
      }
    }

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}
