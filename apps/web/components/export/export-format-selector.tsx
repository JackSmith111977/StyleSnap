'use client'

import { cn } from '@/lib/utils'
import { EXPORT_FORMATS } from '@/lib/code-export-types'
import type { ExportFormat } from '@/lib/code-export-types'

interface ExportFormatSelectorProps {
  value: ExportFormat
  onChange: (format: ExportFormat) => void
}

export function ExportFormatSelector({ value, onChange }: ExportFormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {EXPORT_FORMATS.map((format) => (
        <button
          key={format.id}
          type="button"
          onClick={() => onChange(format.id as ExportFormat)}
          className={cn(
            'rounded-md border p-3 text-left transition-all',
            value === format.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
          )}
        >
          <div className="font-medium">{format.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{format.description}</div>
        </button>
      ))}
    </div>
  )
}
