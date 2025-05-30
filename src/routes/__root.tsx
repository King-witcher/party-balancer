import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">Party Balancer</div>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 [&.active]:bg-gray-700 [&.active]:font-bold"
            >
              Home
            </Link>
            <Link
              to="/compute"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 [&.active]:bg-gray-700 [&.active]:font-bold"
            >
              Compute
            </Link>
          </div>
        </div>
      </nav>
      <hr />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})
