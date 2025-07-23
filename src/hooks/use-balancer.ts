import { useMemo, useState } from 'react'
import { usePlayers } from '../contexts/players-context'

export type Team = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
]

export function useMatchBalancer() {
  const { players } = usePlayers()

  const [blue, setBlue] = useState<Team>([null, null, null, null, null])
  const [red, setRed] = useState<Team>([null, null, null, null, null])

  const isFull = useMemo(() => {
    return blue.every((p) => p !== null) && red.every((p) => p !== null)
  }, [blue, red])

  function setPlayer(team: 'blue' | 'red', index: number, player: string) {
    if (team === 'blue') {
      setBlue((prev) => {
        const newTeam = [...prev] as typeof prev
        newTeam[index] = player || null
        return newTeam
      })
    } else {
      setRed((prev) => {
        const newTeam = [...prev] as typeof prev
        newTeam[index] = player || null
        return newTeam
      })
    }
  }

  function getDisparity(team1: Team, team2: Team) {
    const score1 = team1.reduce(
      (sum, player) => sum + (player ? players[player].score : 0),
      0
    )
    const score2 = team2.reduce(
      (sum, player) => sum + (player ? players[player].score : 0),
      0
    )
    return Math.abs(score1 - score2)
  }

  function hardBalance() {
    const involvedPlayers = [
      ...blue.filter((p) => p !== null),
      ...red.filter((p) => p !== null),
    ].sort(() => Math.random() - 0.5)

    if (involvedPlayers.length < 10) {
      console.warn('Not enough players to balance teams')
      return
    }

    // Balance the teams
    let bestDisparity = Number.POSITIVE_INFINITY
    let bestBlue: Team = [null, null, null, null, null]
    let bestRed: Team = [null, null, null, null, null]

    const i = 0
    for (let j = i + 1; j < involvedPlayers.length - 3; j++) {
      for (let k = j + 1; k < involvedPlayers.length - 2; k++) {
        for (let l = k + 1; l < involvedPlayers.length - 1; l++) {
          for (let m = l + 1; m < involvedPlayers.length; m++) {
            const team1 = [
              involvedPlayers[i],
              involvedPlayers[j],
              involvedPlayers[k],
              involvedPlayers[l],
              involvedPlayers[m],
            ] as Team
            const team2 = involvedPlayers.filter(
              (p) => !team1.includes(p)
            ) as Team

            const disparity = getDisparity(team1, team2)

            if (disparity < bestDisparity) {
              bestDisparity = disparity
              bestBlue = team1
              bestRed = team2
            }
          }
        }
      }
    }

    const coinflip = Math.random() < 0.5
    setBlue(coinflip ? bestBlue : bestRed)
    setRed(coinflip ? bestRed : bestBlue)
  }

  function softBalance() {
    const booleans = [false, true]
    const invertTop = Math.random() < 0.5
    let bestDisparity = Number.POSITIVE_INFINITY
    let bestBlue: Team = [null, null, null, null, null]
    let bestRed: Team = [null, null, null, null, null]
    for (const invertJungle of booleans) {
      for (const invertMid of booleans) {
        for (const invertBot of booleans) {
          for (const invertSupport of booleans) {
            const newBlue: Team = [
              invertTop ? red[0] : blue[0],
              invertJungle ? red[1] : blue[1],
              invertMid ? red[2] : blue[2],
              invertBot ? red[3] : blue[3],
              invertSupport ? red[4] : blue[4],
            ]
            const newRed: Team = [
              invertTop ? blue[0] : red[0],
              invertJungle ? blue[1] : red[1],
              invertMid ? blue[2] : red[2],
              invertBot ? blue[3] : red[3],
              invertSupport ? blue[4] : red[4],
            ]
            const disparity = getDisparity(newBlue, newRed)
            if (disparity < bestDisparity) {
              bestDisparity = disparity
              bestBlue = newBlue
              bestRed = newRed
            }
          }
        }
      }
    }

    setBlue(bestBlue)
    setRed(bestRed)
  }

  function getTeamsText(): string {
    return 'Blue:\n' + `${blue.join('\n')}\n` + '\nRed:\n' + `${red.join('\n')}`
  }

  return {
    blue,
    red,
    isFull,
    setPlayer,
    hardBalance,
    softBalance,
    getTeamsText,
  }
}
