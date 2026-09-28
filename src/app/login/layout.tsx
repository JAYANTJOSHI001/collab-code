import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Collab',
  description: 'Sign in to Collab with your GitHub account',
  openGraph: {
    title: 'Login | Collab',
    description: 'Sign in to Collab with your GitHub account'
  }
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}