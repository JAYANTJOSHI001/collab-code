import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Profile | Collab',
  description: 'View and manage your Collab profile',
  openGraph: {
    title: 'User Profile | Collab',
    description: 'View and manage your Collab profile'
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}