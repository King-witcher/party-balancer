import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { JsonSerializer } from '@/lib/serialization/json-serializer'
import z from 'zod'
import { LocalStoragePlayerStoreProvider } from '@/contexts/player-store/local-storage-player-store'

const client = new QueryClient()

const storeSerializer = new JsonSerializer({
  prettyPrint: import.meta.env.DEV,
  schema: z.array(
    z.object({
      name: z.string(),
      k: z.number(),
      score: z.number(),
    })
  ),
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={client}>
      <LocalStoragePlayerStoreProvider serializer={storeSerializer}>
        <Outlet />
      </LocalStoragePlayerStoreProvider>
      <Toaster />
    </QueryClientProvider>
  ),
})
