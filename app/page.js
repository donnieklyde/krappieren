"use client";
import Feed from "./components/Feed";
import GuestLanding from "./components/GuestLanding";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div style={{ background: 'black', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 99999 }}></div>;

  if (!session) {
    return <GuestLanding />;
  }

  return (
    <Feed />
  );
}
