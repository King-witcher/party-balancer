import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { PlayersProvider } from '../contexts/players-context'

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <hr />
      <PlayersProvider>
        <Outlet />
      </PlayersProvider>
    </>
  ),
})
