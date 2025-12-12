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

type ServiceData = {
  id: string
  name: string
}

interface DeleteServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  service: ServiceData
}

export function DeleteServiceDialog({
  open,
  onOpenChange,
  onSuccess,
  service,
}: DeleteServiceDialogProps) {
  const deleteMutation = trpc.catalog.services.delete.useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: service.id })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Supprimer le service</DialogTitle>
          <DialogDescription>
            Etes-vous sur de vouloir supprimer le service "{service.name}" ? Cette action est
            irreversible.
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
