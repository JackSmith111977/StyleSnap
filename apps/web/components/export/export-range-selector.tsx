'use client'

import { cn } from '@/lib/utils'
import { EXPORT_RANGES } from '@/lib/code-export-types'
import type { ExportRange } from '@/lib/code-export-types'

interface ExportRangeSelectorProps {
  value: ExportRange
  onChange: (range: ExportRange) => void
}

export function ExportRangeSelector({ value, onChange }: ExportRangeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {EXPORT_RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          onClick={() => onChange(range.id as ExportRange)}
          className={cn(
            'rounded-md border p-3 text-center transition-all',
            value === range.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
          )}
        >
          <div className="font-medium">{range.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{range.description}</div>
        </button>
      ))}
    </div>
  )
}
