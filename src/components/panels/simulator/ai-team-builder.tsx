import { useState } from 'react'
import { Info, Loader2, Sparkles } from 'lucide-react'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlayerStore } from '@/contexts/player-store/player-store-context'
import { useRatingSystem } from '@/contexts/rating-system-context'
import { useLocalStorage } from '@/hooks/use-local-storage'

const OPENAI_MODEL = 'gpt-4.1-mini'
const OPENAI_KEY_STORAGE = 'openai-api-key'

const teamStructureSchema = z.object({
  canStructure: z.boolean().describe('true se conseguir estruturar os times'),
  errorReason: z.string().nullable().describe('Motivo pelo qual falhou'),
  blueTeam: z
    .array(z.string())
    .nullable()
    .describe('Lista dos 5 nicknames do time 1'),
  redTeam: z
    .array(z.string())
    .nullable()
    .describe('Lista dos 5 nicknames do time 2'),
})

const SYSTEM_PROMPT = `Você é um assistente que extrai composições de times 5v5 (League of Legends) a partir de texto livre.

Devem haver 5 jogadores em cada time.

Extraia os nicknames dos jogadores EXATAMENTE como aparecem no texto - não normalize, traduza, abrevie ou invente nicknames.

Não devem haver nicks repetidos entre os times.

Em caso de erro, expliqeu o motivo`

type ResolvedPlayer = {
  rawName: string
  resolvedName: string
  isNew: boolean
}

type ResolvedResult = {
  blue: ResolvedPlayer[]
  red: ResolvedPlayer[]
}

type Props = {
  setPlayer: (
    team: 'blue' | 'red',
    index: number,
    playerName: string | null
  ) => void
}

export function AiTeamBuilder({ setPlayer }: Props) {
  const playerStore = usePlayerStore()
  const ratingSystem = useRatingSystem()
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useLocalStorage<string>(OPENAI_KEY_STORAGE, '')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ResolvedResult | null>(null)
  const [editingKey, setEditingKey] = useState(false)

  function reset() {
    setText('')
    setPreview(null)
    setEditingKey(false)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) reset()
  }

  function resolvePlayer(rawName: string): ResolvedPlayer {
    const trimmed = rawName.trim()
    const lowerCase = trimmed.toLowerCase()
    const existing = playerStore.playersList.find(
      (p) => p.name.toLowerCase() === lowerCase
    )
    if (existing) {
      return { rawName: trimmed, resolvedName: existing.name, isNew: false }
    }
    return { rawName: trimmed, resolvedName: trimmed, isNew: true }
  }

  async function handleStructure() {
    if (!apiKey.trim() || !text.trim()) return
    setLoading(true)
    try {
      const client = new OpenAI({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      })

      const completion = await client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        response_format: zodResponseFormat(
          teamStructureSchema,
          'team_structure'
        ),
      })

      const message = completion.choices[0]?.message
      if (message?.refusal) {
        throw new Error(`Modelo recusou: ${message.refusal}`)
      }

      const parsed = message?.parsed
      if (!parsed) {
        throw new Error('Resposta vazia da OpenAI.')
      }

      if (!parsed.canStructure || !parsed.blueTeam || !parsed.redTeam) {
        toast.error(
          parsed.errorReason ||
            'Não foi possível estruturar os times a partir do texto.',
          { closeButton: true }
        )
        return
      }

      if (parsed.blueTeam.length !== 5 || parsed.redTeam.length !== 5) {
        toast.error(
          `A IA retornou ${parsed.blueTeam.length} jogadores no time Ordem e ${parsed.redTeam.length} no time Caos. São necessários exatamente 5 em cada.`,
          { closeButton: true }
        )
        return
      }

      const allNames = [...parsed.blueTeam, ...parsed.redTeam].map((n) =>
        n.trim().toLowerCase()
      )
      if (new Set(allNames).size !== 10) {
        toast.error(
          'A IA retornou jogadores duplicados entre os times. Cada nome deve ser único.',
          { closeButton: true }
        )
        return
      }

      setPreview({
        blue: parsed.blueTeam.map(resolvePlayer),
        red: parsed.redTeam.map(resolvePlayer),
      })
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido.'
      toast.error(`Falha ao estruturar times: ${message}`, {
        closeButton: true,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    const initial = ratingSystem.getInitialRating()

    const allPlayers = [...preview.blue, ...preview.red]
    for (const player of allPlayers) {
      if (player.isNew) {
        await playerStore.create({
          name: player.resolvedName,
          score: initial.power,
          k: initial.kFactor,
          date: new Date(),
        })
      }
    }

    preview.blue.forEach((p, i) => setPlayer('blue', i, p.resolvedName))
    preview.red.forEach((p, i) => setPlayer('red', i, p.resolvedName))

    const newCount = allPlayers.filter((p) => p.isNew).length
    toast.success(
      newCount > 0
        ? `Times montados! ${newCount} novo(s) jogador(es) criado(s).`
        : 'Times montados com IA!',
      { closeButton: true }
    )
    handleOpenChange(false)
  }

  const showApiKeyInput = !apiKey.trim() || editingKey

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white"
        >
          <Sparkles size={16} />
          Extrair com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Extrair times com IA</DialogTitle>
          <DialogDescription>
            Cole um texto descrevendo os dois times (5v5) e a IA vai
            estruturá-los para você.
          </DialogDescription>
        </DialogHeader>

        {!preview && (
          <div className="flex flex-col gap-4">
            {showApiKeyInput ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="openai-key">Chave da API OpenAI</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Mais informações sobre a chave da API"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="leading-relaxed">
                        Gere suas chaves em{' '}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          platform.openai.com/api-keys
                        </a>
                        . Caso os US$5 iniciais acabem, é possível comprar
                        créditos a partir de US$5 em{' '}
                        <a
                          href="https://platform.openai.com/settings/organization/billing/overview"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          platform.openai.com/settings/organization/billing/overview
                        </a>
                        .
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  A chave fica salva apenas no seu navegador (localStorage).
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Chave da API OpenAI configurada.</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setEditingKey(true)}
                >
                  Alterar chave
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="ai-text">Texto dos times</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Mais informações sobre o texto"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="leading-relaxed">
                      Qualquer texto que expresse a formação dos dois times —
                      desde que contenha os nicknames exatos dos jogadores e não
                      seja excessivamente complexo.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <textarea
                id="ai-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  'Ex.:\nTime 1: Fulano, Ciclano, Beltrano, Sicrano, Joãozinho\nTime 2: Maria, Ana, Luiza, Carla, Fernanda'
                }
                rows={8}
                className="border-input dark:bg-input/30 px-3 py-2 rounded-md border bg-transparent text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y"
              />
            </div>
          </div>
        )}

        {preview && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Revise os jogadores antes de aplicar:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <PreviewColumn
                label="Ordem"
                colorClass="text-blue-400"
                players={preview.blue}
              />
              <PreviewColumn
                label="Caos"
                colorClass="text-red-400"
                players={preview.red}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Jogadores marcados como{' '}
              <span className="text-emerald-400 font-medium">Novo</span> serão
              criados na base com a pontuação inicial. Os marcados como{' '}
              <span className="text-foreground font-medium">Existente</span>{' '}
              serão reutilizados.
            </p>
          </div>
        )}

        <DialogFooter>
          {!preview ? (
            <Button
              onClick={handleStructure}
              disabled={loading || !apiKey.trim() || !text.trim()}
            >
              {loading && <Loader2 className="animate-spin" />}
              Extrair
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setPreview(null)}>
                Voltar
              </Button>
              <Button onClick={handleConfirm}>Confirmar e montar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PreviewColumn({
  label,
  colorClass,
  players,
}: {
  label: string
  colorClass: string
  players: ResolvedPlayer[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4
        className={`font-bold uppercase text-sm tracking-wider ${colorClass}`}
      >
        {label}
      </h4>
      <ul className="flex flex-col gap-1.5">
        {players.map((p, i) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: stable order from preview
            key={`${label}-${i}`}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="flex flex-col leading-tight">
              <span>{p.resolvedName}</span>
              {p.rawName !== p.resolvedName && (
                <span className="text-[10px] text-muted-foreground">
                  do texto: {p.rawName}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                p.isNew
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {p.isNew ? 'Novo' : 'Existente'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
