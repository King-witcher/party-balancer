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
  console.log(players)

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

  function balanceTeams() {
    const involvedPlayers = [
      ...blue.filter((p) => p !== null),
      ...red.filter((p) => p !== null),
    ]

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

  return {
    blue,
    red,
    isFull,
    setPlayer,
    balanceTeams,
  }
}
