import { Toaster } from "react-hot-toast";
import { Inter  } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "./StoreProvider";
import "./globals.css";

const inter  = Inter ({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Ben Que Market",
  description: "Ben Que Market",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      afterSignOutUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <StoreProvider>
            <Toaster />
            {children}
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
