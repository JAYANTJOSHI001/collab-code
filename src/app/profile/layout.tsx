import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Collab profile and settings',
  openGraph: {
    title: 'Profile | Collab',
    description: 'Manage your Collab profile and settings'
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}