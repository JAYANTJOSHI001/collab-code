import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Rooms | Collab',
  description: 'View and join your collaboration rooms',
  openGraph: {
    title: 'Your Rooms | Collab',
    description: 'View and join your collaboration rooms'
  }
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}