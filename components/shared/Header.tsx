"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { LogIn, Mail, Phone, Shield } from "lucide-react";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

import React, { useEffect, useState } from "react";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISetting } from "@/lib/database/models/setting.model";
import { FaFacebookF, FaMagnifyingGlass, FaUsers } from "react-icons/fa6";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import Link from "next/link";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

interface HeaderProps {
  openSearch: () => void;
}

export default function Header({ openSearch }: HeaderProps) {
  const { user } = useUser();

  const [adminStatus, setAdminStatus] = useState(false);
  const [settings, setSettings] = useState<ISetting | null>(null);
  const themeColor = settings?.theme || "#000000";

  // Fetch settings once
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting();
        setSettings(setting);
      } catch (err) {
        console.error("Settings load failed", err);
      }
    };

    fetchSettings();
  }, []);

  // Fetch admin status once when user loads
  useEffect(() => {
    if (!user?.id) {
      setAdminStatus(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userID = await getUserByClerkId(user.id);
        const email = await getUserEmailById(userID);
        const admin = await isAdmin(email);

        setAdminStatus(admin);
      } catch {
        setAdminStatus(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return (
    <header className="text-white bg-white">
      {/* Top support bar */}
      <div style={{ backgroundColor: themeColor }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 w-full">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <p className="flex items-center gap-1 text-white text-xs md:text-sm font-semibold">
              <Phone size={14} /> {settings?.phoneNumber}
            </p>
            <p className="hidden md:flex items-center gap-1 text-white text-xs md:text-sm font-semibold">
              <Mail size={14} /> {settings?.email}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 w-full md:w-auto">
            <div className="hidden md:flex items-center justify-center gap-2 text-sm md:text-base">
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
                >
                  <FaFacebookF size={20} />
                </a>
              )}

              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
                >
                  <FaInstagram size={20} />
                </a>
              )}

              {settings?.twitter && (
                <a
                  href={settings.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
                >
                  <FaTwitter size={20} />
                </a>
              )}

              {settings?.facebookGroup && (
                <a
                  href={settings.facebookGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
                >
                  <FaUsers size={20} />
                </a>
              )}

              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
                >
                  <FaYoutube size={20} />
                </a>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <SignedIn>
                {adminStatus && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-md bg-white text-primary hover:bg-primary hover:text-white border-primary"
                  >
                    <a href="/dashboard" className="flex items-center gap-1">
                      <Shield />
                      <span className="hidden md:flex">Dashboard</span>
                    </a>
                  </Button>
                )}

                <UserButton afterSwitchSessionUrl="/" />
              </SignedIn>

              <SignedOut>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-md bg-white text-primary hover:bg-primary hover:text-white border-primary"
                >
                  <a href={"/sign-in"} className="flex items-center gap-1">
                    <LogIn />
                    <span>Login</span>
                  </a>
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 max-w-7xl mx-auto bg-white">
        <Link href={"/"}>
          <div className="relative w-16 md:w-32 h-10 rounded-md overflow-hidden bg-primary-500">
            <Image
              src={settings?.logo || "/assets/images/logo.png"}
              fill
              className="object-contain rounded-md"
              alt={settings?.name || "Logo"}
            />
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md w-full mx-4">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-400 text-gray-400 transition w-full"
          >
            <FaMagnifyingGlass />
            Search...
          </button>
        </div>

        <nav className="lg:flex hidden w-full max-w-xs">
          <NavItems />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
