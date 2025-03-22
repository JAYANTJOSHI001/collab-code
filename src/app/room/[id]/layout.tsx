import { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // You can fetch data for the specific room here if needed
  const roomId = params.id
  
  return {
    title: `Collaboration Room `,
    description: `Collaborate in real-time in room ${roomId}`,
    openGraph: {
      title: `Collaboration Room | Collab`,
      description: `Collaborate in real-time in room ${roomId}`
    }
    // Note: Icons are inherited from the root layout
  }
}

export default function RoomDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}