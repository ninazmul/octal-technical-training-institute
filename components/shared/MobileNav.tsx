"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ISetting } from "@/lib/database/models/setting.model";
import { getSetting } from "@/lib/actions/setting.actions";
import NavItems from "./NavItems";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ISetting | null>(null);

  useEffect(() => {
    (async () => {
      const setting = await getSetting();
      setSettings(setting);
    })();
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <nav className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="align-middle">
          <Menu size={32} className="text-primary" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col gap-6 bg-white lg:hidden w-11/12"
        >
          <div className="relative w-full h-10 rounded-md overflow-hidden bg-primary">
            <Image
              src={settings?.logo || "/assets/images/logo.png"}
              fill
              className="object-contain rounded-md"
              alt={settings?.name || "Logo"}
            />
          </div>
          <NavItems onItemSelected={handleClose} />
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
