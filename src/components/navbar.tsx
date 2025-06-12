import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Party Balancer</div>
        <div className="flex gap-4">
          <Link
            to="/players"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition duration-300 [&.active]:bg-gray-700 [&.active]:font-bold"
          >
            Players
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
  )
}
