"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { LogIn, Mail, Shield } from "lucide-react";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

import React, { useEffect, useState } from "react";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import { FaFacebookF, FaMagnifyingGlass } from "react-icons/fa6";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import Link from "next/link";
import {
  FaInstagram,
  FaTwitter,
  FaUsers,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

interface HeaderProps {
  openSearch: () => void;
}

export default function Header({ openSearch }: HeaderProps) {
  const { user } = useUser();

  const [adminStatus, setAdminStatus] = useState(false);
  const [settings, setSettings] = useState<ISettingSafe | null>(null);
  const themeColor = settings?.theme || "#0055CE";

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
    <header className="bg-white text-gray-900 shadow-md">
      {/* Top support bar */}
      <div style={{ backgroundColor: themeColor }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between py-2 px-4">
          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 font-semibold text-white">
            {settings?.phoneNumber && (
              <p className="flex items-center gap-1">
                <a
                  href={`https://wa.me/${settings.phoneNumber}?text=Hello%2C%20I%20am%20reaching%20out%20via%20your%20official%20website%20and%20would%20like%20to%20learn%20more%20about%20your%20services.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:border-b transition-colors"
                >
                  <FaWhatsapp size={16} />{" "}
                  {settings.phoneNumber}
                </a>
              </p>
            )}
            {settings?.email && (
              <p className="hidden md:flex items-center gap-1">
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-1 hover:border-b transition-colors"
                >
                  <Mail size={16} /> {settings.email}
                </a>
              </p>
            )}
          </div>

          {/* Social + Auth */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center justify-center gap-2 text-sm md:text-base">
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-110"
                >
                  <FaFacebookF size={18} />
                </a>
              )}
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-110"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {settings?.twitter && (
                <a
                  href={settings.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-110"
                >
                  <FaTwitter size={18} />
                </a>
              )}
              {settings?.facebookGroup && (
                <a
                  href={settings.facebookGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-110"
                >
                  <FaUsers size={18} />
                </a>
              )}
              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-110"
                >
                  <FaYoutube size={18} />
                </a>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <SignedIn>
                {adminStatus && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-white text-primary border-primary hover:bg-primary-700 hover:text-white"
                  >
                    <a
                      href="/dashboard"
                      target="_blank"
                      className="flex items-center gap-1"
                    >
                      <Shield size={16} />{" "}
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
                  className="bg-white text-primary border-primary hover:bg-primary-700 hover:text-white"
                >
                  <a href={"/sign-in"} className="flex items-center gap-1">
                    <LogIn size={16} /> <span>Login</span>
                  </a>
                </Button>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
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
        <div className="flex-grow w-full">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-xl border border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition"
          >
            <FaMagnifyingGlass /> Search...
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex flex-grow justify-center">
          <NavItems />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
