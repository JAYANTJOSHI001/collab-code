import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Collaboration Room`,
    description: `Collaborate in real-time in room`,
    openGraph: {
      title: `Collaboration Room | Collab`,
      description: `Collaborate in real-time in room`,
    },
  };
}

export default function RoomDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
