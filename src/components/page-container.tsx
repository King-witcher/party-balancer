import type { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function PageContainer({ children }: Props) {
  return (
    <div className="w-full flex justify-center px-15 py-10">
      <div className="w-full max-w-300">{children}</div>
    </div>
  )
}
