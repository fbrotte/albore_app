import * as React from 'react'
import { Pencil, Check, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EditableTextProps {
  sectionKey: string
  defaultText: string
  customText?: string | null
  onSave: (sectionKey: string, text: string) => void
  onReset?: (sectionKey: string) => void
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div'
  multiline?: boolean
}

export function EditableText({
  sectionKey,
  defaultText,
  customText,
  onSave,
  onReset,
  className,
  as: Component = 'p',
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedText, setEditedText] = React.useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const displayText = customText ?? defaultText
  const isCustomized = customText !== null && customText !== undefined && customText !== defaultText

  const handleStartEditing = () => {
    setEditedText(displayText)
    setIsEditing(true)
  }

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline])

  const handleSave = () => {
    onSave(sectionKey, editedText)
    setIsEditing(false)
  }

  const handleReset = () => {
    if (onReset) {
      onReset(sectionKey)
    } else {
      onSave(sectionKey, defaultText)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className="print:hidden">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-md border border-primary/50 bg-white px-3 py-2',
              'text-[0.85rem] leading-relaxed text-[#2d3748]',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              'min-h-[100px] resize-y',
            )}
            data-testid="editable-text-input"
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-md border border-primary/50 bg-white px-3 py-2',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              className,
            )}
            data-testid="editable-text-input"
          />
        )}

        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium',
              'bg-primary text-white transition-colors hover:bg-primary/90',
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium',
              'bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200',
            )}
          >
            <X className="h-3.5 w-3.5" />
            Annuler
          </button>
          {isCustomized && (
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium',
                'bg-orange-100 text-orange-700 transition-colors hover:bg-orange-200',
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reinitialiser
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {multiline ? 'Cmd+Entree pour sauvegarder' : 'Entree pour sauvegarder'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <span className="group relative inline">
      <Component className={className}>{displayText}</Component>
      <button
        type="button"
        onClick={handleStartEditing}
        className={cn(
          'absolute -right-7 top-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100',
          'hover:bg-gray-100 print:hidden',
          isCustomized ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
        )}
        aria-label={`Modifier ${sectionKey}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
    </span>
  )
}
