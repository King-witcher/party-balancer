import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export type Props = ComponentProps<'div'>

export function Panel({ className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-gray-200 bg-white shadow-md',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
