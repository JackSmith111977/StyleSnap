'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBox() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  const handleSearch = (searchValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue.trim()) {
        params.set('search', searchValue.trim())
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    handleSearch(newValue)
  }

  const handleClear = () => {
    setValue('')
    handleSearch('')
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="搜索风格名称、描述..."
        value={value}
        onChange={handleChange}
        className="w-full pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
