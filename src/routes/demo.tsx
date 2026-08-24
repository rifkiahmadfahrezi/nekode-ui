import DataTableExample from '@/registry/ui/DataTableExample'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DataTableExample />
}

