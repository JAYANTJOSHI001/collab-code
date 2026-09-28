import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication Error | Collab',
  description: 'An error occurred during authentication',
  openGraph: {
    title: 'Authentication Error | Collab',
    description: 'An error occurred during authentication'
  }
}

export default function ErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}