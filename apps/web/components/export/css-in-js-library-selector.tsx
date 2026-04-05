'use client'

import { cn } from '@/lib/utils'
import type { CssInJsLibrary } from '@/types/code-export'

interface CssInJsLibrarySelectorProps {
  value: CssInJsLibrary
  onChange: (library: CssInJsLibrary) => void
}

export function CssInJsLibrarySelector({ value, onChange }: CssInJsLibrarySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { id: 'styled-components' as CssInJsLibrary, label: 'Styled Components', description: 'React 社区最流行的 CSS-in-JS 库' },
        { id: 'emotion' as CssInJsLibrary, label: 'Emotion', description: '高性能 CSS-in-JS 库' },
      ].map((lib) => (
        <button
          key={lib.id}
          type="button"
          onClick={() => onChange(lib.id)}
          className={cn(
            'rounded-md border p-3 text-left transition-all',
            value === lib.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
          )}
        >
          <div className="font-medium">{lib.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{lib.description}</div>
        </button>
      ))}
    </div>
  )
}
