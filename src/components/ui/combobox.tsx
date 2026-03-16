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
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
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
  onCreateOption?: (name: string) => void
  placeholder?: string
  className?: string
  buttonProps?: ComponentProps<'button'>
}

export function Combobox({
  onChange,
  options,
  value,
  onCreateOption,
  buttonProps,
}: Props) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  function handleChange(value: string | null) {
    setOpen(false)
    setInputValue('')
    onChange(value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const exists = options.some(
      (o) => o.label.toLowerCase() === trimmed.toLowerCase()
    )
    if (!exists && onCreateOption) {
      onCreateOption(trimmed)
      setOpen(false)
      setInputValue('')
    }
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
            'data-[empty=true]:text-muted-foreground data-[empty=true]:font-normal'
          )}
          {...buttonProps}
        >
          {value
            ? (options.find((option) => option.id === value)?.label ?? value)
            : 'Select player...'}
          <ChevronsUpDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[270px]">
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {inputValue.trim() &&
              !options.some(
                (o) => o.label.toLowerCase() === inputValue.trim().toLowerCase()
              ) && (
                <CommandItem
                  value={`__create__${inputValue}`}
                  onSelect={() => {
                    if (onCreateOption) {
                      onCreateOption(inputValue.trim())
                      setOpen(false)
                      setInputValue('')
                    }
                  }}
                  className="text-muted-foreground"
                >
                  <Plus size={14} />
                  Criar "{inputValue.trim()}"
                </CommandItem>
              )}
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  className={
                    option.id === value ? 'bg-accent font-semibold' : ''
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
