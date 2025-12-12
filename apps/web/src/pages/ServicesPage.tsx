import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/layout/AppLayout'
import { trpc } from '@/lib/trpc'
import { ServiceFormDialog } from '@/components/services/ServiceFormDialog'
import { DeleteServiceDialog } from '@/components/services/DeleteServiceDialog'
import { CategoryFormDialog } from '@/components/services/CategoryFormDialog'
import { DeleteCategoryDialog } from '@/components/services/DeleteCategoryDialog'

type ServiceWithCategory = {
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
  category: { id: string; name: string } | null
}

type CategoryData = {
  id: string
  name: string
  description: string | null
  icon: string | null
  displayOrder: number
}

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithCategory | null>(null)
  const [deletingService, setDeletingService] = useState<ServiceWithCategory | null>(null)

  // Category state
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null)

  const {
    data: categories,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = trpc.catalog.categories.list.useQuery()
  const {
    data: services,
    isLoading: loadingServices,
    refetch: refetchServices,
  } = trpc.catalog.services.list.useQuery()

  const refetch = () => {
    refetchCategories()
    refetchServices()
  }

  const isLoading = loadingCategories || loadingServices

  // Group services by category
  const servicesByCategory = services?.reduce(
    (acc, service) => {
      const catId = service.categoryId
      if (!acc[catId]) {
        acc[catId] = []
      }
      acc[catId].push(service as ServiceWithCategory)
      return acc
    },
    {} as Record<string, ServiceWithCategory[]>,
  )

  // Filter services based on search
  const filteredCategories = categories?.filter((category) => {
    const categoryServices = servicesByCategory?.[category.id] || []
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      category.name.toLowerCase().includes(searchLower) ||
      categoryServices.some(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.semanticDescription.toLowerCase().includes(searchLower),
      )
    )
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    refetch()
  }

  const handleEditSuccess = () => {
    setEditingService(null)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setDeletingService(null)
    refetch()
  }

  // Category handlers
  const handleCreateCategorySuccess = () => {
    setIsCreateCategoryDialogOpen(false)
    refetch()
  }

  const handleEditCategorySuccess = () => {
    setEditingCategory(null)
    refetch()
  }

  const handleDeleteCategorySuccess = () => {
    setDeletingCategory(null)
    refetch()
  }

  const getFilteredServices = (categoryId: string) => {
    const categoryServices = servicesByCategory?.[categoryId] || []
    if (!search) return categoryServices
    const searchLower = search.toLowerCase()
    return categoryServices.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.semanticDescription.toLowerCase().includes(searchLower),
    )
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(numPrice)
  }

  const getBillingLabel = (billingType: string) => {
    switch (billingType) {
      case 'RECURRING':
        return 'Recurrent'
      case 'ONE_TIME':
        return 'Ponctuel'
      case 'USAGE':
        return 'Usage'
      default:
        return billingType
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Catalogue de services</h1>
            <p className="text-muted-foreground">Gerez vos services et leurs tarifications</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsCreateCategoryDialogOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Nouvelle categorie
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau service
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories and Services */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const categoryServices = getFilteredServices(category.id)
              const isExpanded = expandedCategories.has(category.id)

              return (
                <Card key={category.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="rounded-lg bg-primary/10 p-2">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          {category.description && (
                            <CardDescription>{category.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{categoryServices.length} services</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCategory(category as CategoryData)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingCategory(category as CategoryData)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t pt-4">
                      {categoryServices.length === 0 ? (
                        <p className="py-4 text-center text-muted-foreground">
                          Aucun service dans cette categorie
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {categoryServices.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="rounded-md bg-muted p-2">
                                  <Package className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium">{service.name}</h4>
                                    {!service.isActive && (
                                      <Badge variant="secondary">Inactif</Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {service.semanticDescription}
                                  </p>
                                  <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span>
                                      {formatPrice(service.basePrice)} / {service.unitLabel}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {getBillingLabel(service.billingType)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingService(service)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeletingService(service)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {search ? 'Aucun service trouve' : 'Aucun service pour le moment'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {search
                  ? 'Essayez avec un autre terme de recherche'
                  : 'Commencez par ajouter votre premier service'}
              </p>
              {!search && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un service
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <ServiceFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        categories={categories || []}
      />

      {/* Edit Dialog */}
      {editingService && (
        <ServiceFormDialog
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          onSuccess={handleEditSuccess}
          categories={categories || []}
          service={editingService}
        />
      )}

      {/* Delete Dialog */}
      {deletingService && (
        <DeleteServiceDialog
          open={!!deletingService}
          onOpenChange={(open) => !open && setDeletingService(null)}
          onSuccess={handleDeleteSuccess}
          service={deletingService}
        />
      )}

      {/* Category Create Dialog */}
      <CategoryFormDialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
        onSuccess={handleCreateCategorySuccess}
      />

      {/* Category Edit Dialog */}
      {editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          onSuccess={handleEditCategorySuccess}
          category={editingCategory}
        />
      )}

      {/* Category Delete Dialog */}
      {deletingCategory && (
        <DeleteCategoryDialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          onSuccess={handleDeleteCategorySuccess}
          category={deletingCategory}
          serviceCount={servicesByCategory?.[deletingCategory.id]?.length || 0}
        />
      )}
    </AppLayout>
  )
}
