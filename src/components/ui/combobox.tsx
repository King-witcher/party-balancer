import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ComponentProps, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export type ComboboxOption = {
  id: string
  label: string
}

interface Props {
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
  buttonProps?: ComponentProps<'button'>
}

export function Combobox({ onChange, options, value, buttonProps }: Props) {
  const [open, setOpen] = useState(false)

  function handleChange(value: string | null) {
    setOpen(false)
    onChange(value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          size="lg"
          className={twMerge(
            'w-[270px] justify-between',
            'data-[empty=true]:text-gray-600 data-[empty=true]:font-normal'
          )}
          {...buttonProps}
        >
          {value
            ? options.find((option) => option.id === value)?.label
            : 'Select player...'}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[270px]">
        <Command>
          <CommandInput />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  className={
                    option.id === value ? 'bg-gray-100 font-semibold' : ''
                  }
                  key={option.id}
                  onSelect={() => handleChange(option.id)}
                >
                  {option.label}
                  {option.id === value && <Check className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
