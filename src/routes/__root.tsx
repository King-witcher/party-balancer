import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { JsonSerializer } from '@/lib/serialization/json-serializer'
import { LocalStoragePlayerStoreProvider } from '@/contexts/player-store/local-storage-player-store'
import { VersionedSerializer } from '@/lib/serialization/versioned-serializer'

const client = new QueryClient()

const storeSerializer = new VersionedSerializer(
  new JsonSerializer({
    prettyPrint: import.meta.env.DEV,
  })
)

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
