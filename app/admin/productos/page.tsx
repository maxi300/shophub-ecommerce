export const dynamic = 'force-dynamic'

export default function AdminProductsPage() {
  return <AdminProductsWrapper />
}

function AdminProductsWrapper() {
  'use client'
  
  const AdminProductsContent = require('@/components/admin/admin-products-content').default
  return <AdminProductsContent />
}
