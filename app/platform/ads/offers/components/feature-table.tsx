"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { logError } from "@/lib/activity"
import { BaseTableColumn } from "../types"

interface FeatureTableProps<T> {
  data: T[]
  columns: BaseTableColumn<T>[]
  isLoading?: boolean
  onDelete?: (id: string) => Promise<void>
  onEdit?: (id: string) => void
  propertyId?: string
  filters?: Record<string, any>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Card>
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  )
}

export function FeatureTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  onDelete,
  onEdit,
  propertyId,
  filters
}: FeatureTableProps<T>) {
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!onDelete) return
    try {
      setDeletingId(id)
      await onDelete(id)
    } catch (error) {
      await logError('FEATURE', error, {
        component: 'FeatureTable',
        featureId: id,
        propertyId
      })
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) return <LoadingSkeleton />

  if (data.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
          <p className="text-gray-500 mb-4">
            {filters?.search
              ? "Try adjusting your search or filters"
              : "Get started by creating a new item"}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id}>{column.header}</TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => (
              <TableCell key={column.id}>
                {column.cell
                  ? column.cell(row)
                  : column.accessorKey
                  ? String(row[column.accessorKey] || '')
                  : null}
              </TableCell>
            ))}
            <TableCell>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row.id)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(row.id)}
                    disabled={deletingId === row.id}
                  >
                    {deletingId === row.id ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 