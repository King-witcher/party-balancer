import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export type Props = ComponentProps<'div'>

export function Panel({ className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-border bg-card shadow-md',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
