import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { PostsProvider } from "./context/PostsContext";
import { DMsProvider } from "./context/DMsContext";
import { UserProvider } from "./context/UserContext";
import AuthProvider from "./context/AuthProvider";
import OnboardingWrapper from "./components/OnboardingWrapper";
import GlobalListeners from "./components/GlobalListeners";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "krappieren",
  description: "they called it shizophrenia",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom issues
  viewportFit: 'cover', // Enable edge-to-edge rendering
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <div className="container">
          <AuthProvider>
            <PostsProvider>
              <UserProvider>
                <DMsProvider>
                  <GlobalListeners />
                  <OnboardingWrapper />
                  <Navigation />
                  <main className="mainContent">
                    {children}
                  </main>
                </DMsProvider>
              </UserProvider>
            </PostsProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
