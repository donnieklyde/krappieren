"use client";
import { useSession } from "next-auth/react";
import { useUser } from "../context/UserContext";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingWrapper() {
    const { data: session } = useSession();
    const { user, completeOnboarding, isInitialized } = useUser();

    // Condition to show modal:
    // 1. Data is initialized (localStorage read)
    // 2. User is strictly defined and logged in according to our UserContext
    // 3. User has NOT completed onboarding yet
    // Note: checking 'session' alone might be risky if it flickers. 
    // We rely on user context which should sync with session.
    const showOnboarding = isInitialized && session?.user && user && (!user.isOnboarded || user.username?.toLowerCase() === 'newuser');

    if (!showOnboarding) return null;

    return <OnboardingModal onSave={completeOnboarding} />;
}
