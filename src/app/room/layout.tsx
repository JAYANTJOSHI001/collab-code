import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collaboration Room',
  description: 'Real-time code collaboration with your team',
  openGraph: {
    title: 'Collaboration Room | Collab',
    description: 'Real-time code collaboration with your team'
  }
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}