export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return <AdminDashboardWrapper />
}

// Lazy load the actual content to avoid Supabase access during build
function AdminDashboardWrapper() {
  'use client'
  
  const AdminDashboardContent = require('@/components/admin/admin-dashboard-content').default
  return <AdminDashboardContent />
}
