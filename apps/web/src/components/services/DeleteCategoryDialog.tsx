import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'

type CategoryData = {
  id: string
  name: string
}

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category: CategoryData
  serviceCount: number
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
  serviceCount,
}: DeleteCategoryDialogProps) {
  const deleteMutation = trpc.catalog.categories.delete.useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: category.id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Supprimer la categorie</DialogTitle>
          <DialogDescription>
            Etes-vous sur de vouloir supprimer la categorie "{category.name}" ?
            {serviceCount > 0 && (
              <span className="mt-2 block font-medium text-destructive">
                Attention : cette categorie contient {serviceCount} service(s) qui seront egalement
                supprimes.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
