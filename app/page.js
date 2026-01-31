"use client";
import Feed from "./components/Feed";
import GuestLanding from "./components/GuestLanding";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null; // Or a loading spinner

  if (!session) {
    return <GuestLanding />;
  }

  return (
    <Feed />
  );
}
