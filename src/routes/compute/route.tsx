import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/page-container'
import { useMatchBalancer } from '@/hooks/use-balancer'
import { WinProbabilities } from './-win-probabilities'
import { Simulator } from './-simulator'

export const Route = createFileRoute('/compute')({
  component: RouteComponent,
})

function RouteComponent() {
  const { blue, red, isFull, setPlayer, hardBalance, softBalance } =
    useMatchBalancer()

  return (
    <PageContainer className="items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Match Simulator
      </h1>

      <div>
        <Simulator red={red} blue={blue} setPlayer={setPlayer} />

        <WinProbabilities
          blue={blue}
          red={red}
          softBalance={softBalance}
          hardBalance={hardBalance}
          isFull={isFull}
        />
      </div>
    </PageContainer>
  )
}
