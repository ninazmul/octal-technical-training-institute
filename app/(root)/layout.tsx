"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import ScrollHeaderWrapper from "@/components/shared/ScrollHeaderWrapper";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import SearchDrawer from "@/components/shared/SearchDrawer";
import BengaliFontDetector from "@/components/shared/BengaliFontDetector";
import Script from "next/script";
import MaintenancePage from "@/components/shared/MaintenancePage"; // 👈 your animated component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  // Memoized fetch function
  const fetchSettings = useMemo(
    () => async () => {
      try {
        const res = await axios.get("/api/settings", {
          headers: { "Cache-Control": "no-store" },
        });
        setMaintenanceMode(Boolean(res.data?.maintenanceMode));
      } catch {
        setMaintenanceMode(false); // fail-safe
      }
    },
    [],
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Detect localhost:3000
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1") &&
    window.location.port === "3000";

  // Show MaintenancePage if active and not localhost
  if (maintenanceMode && !isLocalhost) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex h-screen flex-col">
      <Toaster />
      <ScrollHeaderWrapper>
        <div
          ref={(el) => {
            if (el) setHeaderHeight(el.offsetHeight);
          }}
        >
          <Header openSearch={() => setSearchOpen(true)} />
        </div>
      </ScrollHeaderWrapper>

      <main style={{ paddingTop: headerHeight }} className="flex-1">
        <BengaliFontDetector />
        {children}
      </main>

      <SearchDrawer
        open={searchOpen}
        onOpenChange={setSearchOpen}
        headerHeight={headerHeight}
      />

      <Footer />

      <Script
        id="tawk-to"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/69c230d629e9681c3d64df82/1jkf8tirp';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />
    </div>
  );
}
