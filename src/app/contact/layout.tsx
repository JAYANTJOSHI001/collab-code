import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Collab',
  description: 'Get in touch with the Collab team for support, feedback, or inquiries',
  openGraph: {
    title: 'Contact Us | Collab',
    description: 'Get in touch with the Collab team for support, feedback, or inquiries'
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}