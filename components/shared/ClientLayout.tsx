"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import ScrollHeaderWrapper from "@/components/shared/ScrollHeaderWrapper";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import SearchDrawer from "@/components/shared/SearchDrawer";
import BengaliFontDetector from "@/components/shared/BengaliFontDetector";
import Script from "next/script";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useLayoutEffect(() => {
    if (headerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setHeaderHeight(headerRef.current!.offsetHeight);
      });

      resizeObserver.observe(headerRef.current);
      setHeaderHeight(headerRef.current.offsetHeight);

      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <Toaster />
      <ScrollHeaderWrapper>
        <div ref={headerRef}>
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
