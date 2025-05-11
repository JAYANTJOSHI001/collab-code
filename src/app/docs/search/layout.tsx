import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Documentation | Collab',
  description: 'Search through Collab documentation',
  openGraph: {
    title: 'Search Documentation | Collab',
    description: 'Search through Collab documentation'
  }
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}