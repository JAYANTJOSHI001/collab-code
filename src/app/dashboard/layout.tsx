import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your coding projects and collaborations',
  openGraph: {
    title: 'Dashboard | Collab',
    description: 'Manage your coding projects and collaborations'
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}