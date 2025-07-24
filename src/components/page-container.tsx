import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  children?: ReactNode
  className?: string
}

export function PageContainer({ children, className }: Props) {
  return (
    <div className={'w-full flex justify-center px-15 py-10'}>
      <div className={twMerge('w-full max-w-300 flex flex-col', className)}>
        {children}
      </div>
    </div>
  )
}
