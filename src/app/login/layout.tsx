import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Collab account',
  openGraph: {
    title: 'Login | Collab',
    description: 'Sign in to your Collab account'
  }
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}