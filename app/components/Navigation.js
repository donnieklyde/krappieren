"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navigation.module.css";
import { usePathname, useRouter } from "next/navigation";

const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const WriteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const DMsIcon = ({ hasUnread }) => (
    <div style={{ position: 'relative' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hasUnread ? "limegreen" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        {hasUnread && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'limegreen', borderRadius: '50%' }}></div>}
    </div>
);
const ActivityIcon = ({ hasNew }) => (
    <div style={{ position: 'relative' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hasNew ? "limegreen" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        {hasNew && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'limegreen', borderRadius: '50%' }}></div>}
    </div>
);
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
const Logo = () => (
    <svg aria-label="Threads" role="img" viewBox="0 0 192 192" width="32" height="32" fill="currentColor"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 53.6093 63.2302 66.3436C55.4516 81.4871 59.4124 100.957 73.1818 111.967C81.8217 118.89 91.9566 119.539 99.7042 119.539C102.502 119.539 105.021 119.421 107.241 119.231C110.155 119.006 113.111 118.665 115.82 118.156C117.027 117.925 118.067 117.702 118.985 117.489C119.646 117.332 120.252 117.18 120.781 117.042C120.899 117.012 121.01 116.983 121.114 116.956C121.15 116.947 121.184 116.938 121.217 116.929C121.261 116.917 121.303 116.906 121.341 116.896C121.737 116.786 122.122 116.67 122.493 116.551C122.756 116.467 123.013 116.38 123.262 116.291C124.621 115.809 125.864 115.289 126.98 114.73C132.883 111.758 136.904 105.748 137.953 98.9209C138.497 95.3781 138.271 91.9329 137.319 88.6205C136.195 91.8906 134.407 94.9743 132.067 97.6493C126.554 103.96 117.485 107.696 106.848 107.696C93.6355 107.696 83.2198 96.9535 83.2198 84.14C83.2198 71.3265 93.9317 60.584 106.903 60.584C116.494 60.584 124.814 66.8617 128.537 75.3976C128.694 75.7538 128.847 76.1132 129 76.4764C131.658 82.6865 132.091 85.9961 132.091 85.9961L132.146 113.882C132.146 126.853 121.632 137.368 108.662 137.368C95.6917 137.368 85.177 126.853 85.177 113.882C85.177 110.151 86.0822 106.638 87.7088 103.486C85.1092 101.442 81.6599 100.222 77.9015 100.222C68.9103 100.222 61.6213 107.511 61.6213 116.502C61.6213 125.493 68.9103 132.782 77.9015 132.782C84.384 132.782 89.969 128.981 92.5709 123.633C96.3986 127.35 101.884 129.816 108.662 129.816C117.464 129.816 124.601 122.68 124.601 113.882V88.6016C124.601 88.6016 122.756 79.5446 118.895 72.8613C116.273 68.2937 112.78 64.675 108.625 61.9965C108.062 61.6343 107.49 61.2796 106.903 60.9142V45.2415C106.903 45.2415 125.795 45.2415 139.77 82.3551C140.232 83.5656 140.669 84.7876 141.082 86.0142C150.395 111.966 129.742 144.912 97.4371 144.912C63.2751 144.912 37.1352 119.063 43.1979 81.3857C45.3906 67.747 51.5273 53.7708 61.3789 42.1793C79.6456 20.6726 109.846 18.0674 109.846 18.0674L114.195 36.3377C114.195 36.3377 92.0019 37.3465 79.6456 50.1829C74.6853 55.352 70.9703 62.0911 68.5135 70.0924C65.578 79.7997 66.8229 89.5934 71.9443 97.8732C71.5542 98.6366 71.3414 99.4975 71.3414 100.414C71.3414 104.939 74.9962 108.593 79.5212 108.593C84.0463 108.593 87.7011 104.939 87.7011 100.414C87.7011 95.8893 84.0463 92.2345 79.5212 92.2345C78.9668 92.2345 78.423 92.2981 77.9015 92.4204C74.4534 83.6923 74.228 73.1873 78.3698 64.9172C82.8948 55.8776 92.9378 49.3347 106.903 49.3347C116.852 49.3347 122.997 55.3371 123.655 63.8587C119.531 66.8617 115.895 70.3667 113.12 75.056C108.625 82.7237 106.903 92.4204 106.903 100.414H129.562C129.562 92.4204 127.84 82.7237 123.345 75.056C121.2 71.3725 118.5 68.04 115.602 65.04L114.714 64.1287L134.463 56.4609C134.463 56.4609 135.342 66.7118 135.342 75.7029C135.342 77.26 135.253 78.817 135.076 80.3741C136.257 81.3341 137.478 82.2045 138.741 82.9846C139.73 83.5935 140.672 84.2882 141.537 84.9829V88.9883H141.537Z"></path></svg>
);

import { useSession, signIn, signOut } from "next-auth/react";

function Navigation() {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState({ hasUnreadDMs: false, hasNewActivity: false });

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Notification Poll Error:", error);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    const searchIsActive = pathname === '/search' || pathname === '/bosses';
    const router = useRouter();
    const { data: session } = useSession();

    // Register Button (Login)
    const handleRegister = async () => {
        if (typeof window !== 'undefined') {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
                try {
                    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                    // Initialize if needed, though usually auto-init works with config
                    await GoogleAuth.initialize();

                    // Force sign-out locally to ensure the user sees the account picker every time
                    await GoogleAuth.signOut();

                    const user = await GoogleAuth.signIn();

                    // Sign in with the custom credentials provider
                    const result = await signIn('google-mobile', {
                        idToken: user.authentication.idToken,
                        email: user.email.toLowerCase(), // Normalize email
                        name: user.name, // or user.displayName
                        image: user.imageUrl,
                        redirect: false,
                    });

                    if (result?.ok) {
                        router.push('/');
                        router.refresh();
                    }
                } catch (error) {
                    console.error("Native Google Login failed:", error);
                }
            } else {
                signIn('google', { callbackUrl: '/' });
            }
        } else {
            signIn('google', { callbackUrl: '/' });
        }
    };

    const handleMockLogin = () => {
        signIn('credentials', { callbackUrl: '/' });
    };

    return (
        <>
            <div className={styles.mobileHeader}>
                <Logo />
            </div>

            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Logo />
                </div>

                <Link href="/" className={styles.link + (pathname === "/" ? " " + styles.active : "")}>
                    <HomeIcon />
                </Link>

                {session ? (
                    <>
                        <Link href="/search" className={styles.link + (pathname === "/search" ? " " + styles.active : "")}>
                            <SearchIcon />
                        </Link>
                        <Link href="/create" className={styles.link + (pathname === "/create" ? " " + styles.active : "")}>
                            <WriteIcon />
                        </Link>
                        <Link href="/activity" className={`${styles.link} ${pathname === '/activity' ? styles.active : ''}`}>
                            <ActivityIcon hasNew={notifications.hasNewActivity} />
                        </Link>
                        <Link href="/dms" className={`${styles.link} ${pathname === '/dms' ? styles.active : ''}`} onClick={() => setNotifications(prev => ({ ...prev, hasUnreadDMs: false }))}>
                            <DMsIcon hasUnread={notifications.hasUnreadDMs} />
                        </Link>
                        <Link href="/profile" className={styles.link + (pathname === "/profile" ? " " + styles.active : "")}>
                            <UserIcon />
                        </Link>

                        <button
                            onClick={() => signOut()}
                            className={`${styles.link} ${styles.logoutBtn}`}
                            title="Logout"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </>
                ) : (
                    <>
                        {/* Sidebar Login Button removed to avoid confusion with Logout */
                        /* The 'GET IN' button is sufficient */}

                        {/* Keep floating register for visibility as per original design, but maybe user wants it in sidebar? 
                            User asked for "add a login button with google login". 
                            The sidebar button above can act as that. 
                            Let's keep the floating one too or remove it?
                            "add a logout botton to the sidebar and add a login button with google login"
                            Implies Login should be available. The floating "REGISTER" effectively logs in via Google.
                            I'll rename it to LOGIN / REGISTER.
                        */}
                        <button
                            onClick={handleRegister}
                            className={styles.comeButton}
                        >
                            Get In
                        </button>

                    </>
                )}
            </nav >
        </>
    );
}

export default Navigation;
