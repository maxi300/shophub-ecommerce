export const dynamic = 'force-dynamic'

export default function AdminOrdersPage() {
  return <AdminOrdersWrapper />
}

function AdminOrdersWrapper() {
  'use client'
  
  const AdminOrdersContent = require('@/components/admin/admin-orders-content').default
  return <AdminOrdersContent />
}
