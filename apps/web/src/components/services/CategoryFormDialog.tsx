import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc'

type CategoryData = {
  id: string
  name: string
  description: string | null
  icon: string | null
  displayOrder: number
}

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category?: CategoryData
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    displayOrder: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        displayOrder: category.displayOrder,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '',
        displayOrder: 0,
      })
    }
    setErrors({})
  }, [category, open])

  const createMutation = trpc.catalog.categories.create.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: { message: string }) => {
      setErrors({ submit: error.message })
    },
  })

  const updateMutation = trpc.catalog.categories.update.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: { message: string }) => {
      setErrors({ submit: error.message })
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon: formData.icon.trim() || undefined,
      displayOrder: formData.displayOrder,
    }

    if (isEditing && category) {
      updateMutation.mutate({ id: category.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la categorie' : 'Nouvelle categorie'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="categoryName">Nom de la categorie *</Label>
            <Input
              id="categoryName"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Telephonie Mobile"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de la categorie..."
              rows={2}
            />
          </div>

          {/* Icon */}
          <div>
            <Label htmlFor="categoryIcon">Icone (emoji ou nom)</Label>
            <Input
              id="categoryIcon"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ex: phone, cloud, server"
            />
          </div>

          {/* Display Order */}
          <div>
            <Label htmlFor="categoryOrder">Ordre d'affichage</Label>
            <Input
              id="categoryOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
            />
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Creer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
