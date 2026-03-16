import { createRootRoute, Outlet } from '@tanstack/react-router'
import { PlayersProvider } from '../contexts/players-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

const client = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={client}>
      <PlayersProvider>
        <Outlet />
      </PlayersProvider>
      <Toaster />
    </QueryClientProvider>
  ),
})
