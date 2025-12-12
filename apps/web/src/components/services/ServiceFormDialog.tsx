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
import { Select } from '@/components/ui/select'
import { trpc } from '@/lib/trpc'

type Category = {
  id: string
  name: string
}

type ServiceData = {
  id: string
  name: string
  semanticDescription: string
  categoryId: string
  unitType: string
  unitLabel: string
  pricingType: string
  basePrice: number | string
  billingType: string
  isActive: boolean
}

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  categories: Category[]
  service?: ServiceData
}

const UNIT_TYPES = [
  { value: 'UNIT', label: 'Unite' },
  { value: 'HOUR', label: 'Heure' },
  { value: 'MONTH', label: 'Mois' },
  { value: 'USER', label: 'Utilisateur' },
  { value: 'LINE', label: 'Ligne' },
  { value: 'DEVICE', label: 'Appareil' },
]

const PRICING_TYPES = [
  { value: 'FIXED', label: 'Fixe' },
  { value: 'PER_UNIT', label: 'Par unite' },
  { value: 'TIERED', label: 'Par paliers' },
  { value: 'VOLUME', label: 'Volume' },
]

const BILLING_TYPES = [
  { value: 'RECURRING', label: 'Recurrent' },
  { value: 'ONE_TIME', label: 'Ponctuel' },
  { value: 'USAGE', label: 'A la consommation' },
]

export function ServiceFormDialog({
  open,
  onOpenChange,
  onSuccess,
  categories,
  service,
}: ServiceFormDialogProps) {
  const isEditing = !!service

  const [formData, setFormData] = useState({
    name: '',
    semanticDescription: '',
    categoryId: '',
    unitType: 'UNIT',
    unitLabel: '',
    pricingType: 'PER_UNIT',
    basePrice: '',
    billingType: 'RECURRING',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        semanticDescription: service.semanticDescription,
        categoryId: service.categoryId,
        unitType: service.unitType,
        unitLabel: service.unitLabel,
        pricingType: service.pricingType,
        basePrice: String(service.basePrice),
        billingType: service.billingType,
        isActive: service.isActive,
      })
    } else {
      setFormData({
        name: '',
        semanticDescription: '',
        categoryId: categories[0]?.id || '',
        unitType: 'UNIT',
        unitLabel: '',
        pricingType: 'PER_UNIT',
        basePrice: '',
        billingType: 'RECURRING',
        isActive: true,
      })
    }
    setErrors({})
  }, [service, categories, open])

  const createMutation = trpc.catalog.services.create.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: { message: string }) => {
      setErrors({ submit: error.message })
    },
  })

  const updateMutation = trpc.catalog.services.update.useMutation({
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
    if (!formData.semanticDescription.trim()) {
      newErrors.semanticDescription = 'La description est requise'
    } else if (formData.semanticDescription.length < 10) {
      newErrors.semanticDescription = 'La description doit faire au moins 10 caracteres'
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'La categorie est requise'
    }
    if (!formData.unitLabel.trim()) {
      newErrors.unitLabel = "Le libelle de l'unite est requis"
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) < 0) {
      newErrors.basePrice = 'Le prix doit etre positif ou nul'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data = {
      name: formData.name.trim(),
      semanticDescription: formData.semanticDescription.trim(),
      categoryId: formData.categoryId,
      unitType: formData.unitType as 'UNIT' | 'HOUR' | 'MONTH' | 'USER' | 'LINE' | 'DEVICE',
      unitLabel: formData.unitLabel.trim(),
      pricingType: formData.pricingType as 'FIXED' | 'PER_UNIT' | 'TIERED' | 'VOLUME',
      basePrice: parseFloat(formData.basePrice),
      billingType: formData.billingType as 'RECURRING' | 'ONE_TIME' | 'USAGE',
      isActive: formData.isActive,
    }

    if (isEditing && service) {
      updateMutation.mutate({ id: service.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Nom du service *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Forfait Mobile Entreprise"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Semantic Description */}
            <div className="col-span-2">
              <Label htmlFor="semanticDescription">Description semantique *</Label>
              <Textarea
                id="semanticDescription"
                value={formData.semanticDescription}
                onChange={(e) => handleChange('semanticDescription', e.target.value)}
                placeholder="Description detaillee du service pour le matching automatique des factures..."
                rows={3}
                className={errors.semanticDescription ? 'border-destructive' : ''}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Cette description est utilisee pour le matching automatique avec les lignes de
                facture
              </p>
              {errors.semanticDescription && (
                <p className="mt-1 text-sm text-destructive">{errors.semanticDescription}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="categoryId">Categorie *</Label>
              <Select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className={errors.categoryId ? 'border-destructive' : ''}
              >
                <option value="">Selectionner une categorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-destructive">{errors.categoryId}</p>
              )}
            </div>

            {/* Unit Type */}
            <div>
              <Label htmlFor="unitType">Type d'unite</Label>
              <Select
                id="unitType"
                value={formData.unitType}
                onChange={(e) => handleChange('unitType', e.target.value)}
              >
                {UNIT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Unit Label */}
            <div>
              <Label htmlFor="unitLabel">Libelle de l'unite *</Label>
              <Input
                id="unitLabel"
                value={formData.unitLabel}
                onChange={(e) => handleChange('unitLabel', e.target.value)}
                placeholder="Ex: mois, utilisateur, Go"
                className={errors.unitLabel ? 'border-destructive' : ''}
              />
              {errors.unitLabel && (
                <p className="mt-1 text-sm text-destructive">{errors.unitLabel}</p>
              )}
            </div>

            {/* Base Price */}
            <div>
              <Label htmlFor="basePrice">Prix de base (EUR) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', e.target.value)}
                placeholder="0.00"
                className={errors.basePrice ? 'border-destructive' : ''}
              />
              {errors.basePrice && (
                <p className="mt-1 text-sm text-destructive">{errors.basePrice}</p>
              )}
            </div>

            {/* Pricing Type */}
            <div>
              <Label htmlFor="pricingType">Type de tarification</Label>
              <Select
                id="pricingType"
                value={formData.pricingType}
                onChange={(e) => handleChange('pricingType', e.target.value)}
              >
                {PRICING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Billing Type */}
            <div>
              <Label htmlFor="billingType">Type de facturation</Label>
              <Select
                id="billingType"
                value={formData.billingType}
                onChange={(e) => handleChange('billingType', e.target.value)}
              >
                {BILLING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Is Active */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">Service actif</span>
              </label>
            </div>
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
