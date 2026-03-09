'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
    id: string
    onDelete: (id: string) => Promise<{ error?: string, success?: boolean }>
    itemName: string
}

export function DeleteButton({ id, onDelete, itemName }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (confirm(`¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`)) {
            setIsDeleting(true)
            try {
                const result = await onDelete(id)
                if (result.error) {
                    alert('Error al eliminar: ' + result.error)
                }
            } catch (error) {
                alert('Ocurrió un error inesperado.')
            } finally {
                setIsDeleting(false)
            }
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
            Eliminar
        </Button>
    )
}
