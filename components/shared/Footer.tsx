"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"; // professional icons
import { useEffect, useState } from "react";
import { getSetting } from "@/lib/actions";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const [setting, setSetting] = useState<ISetting | null>(null);
  const themeColor = setting?.theme || "#000000";

  // Fetch settings once
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting();
        setSetting(setting);
      } catch (err) {
        console.error("Settings load failed", err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="text-white">
      {/* Top Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ backgroundColor: themeColor }}
        className="px-6 md:px-10 py-12 md:py-20 space-y-6"
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Image
            src={setting?.logo || "/assets/images/logo.png"}
            alt="Logo"
            width={200}
            height={200}
            priority
            className="rounded-full"
          />
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
            {setting?.name}
          </h2>
          {setting?.description && (
            <div
              className="text-sm md:text-base leading-relaxed opacity-90 max-w-2xl"
              dangerouslySetInnerHTML={{ __html: setting?.description }}
            />
          )}
        </div>

        {/* Contact Info */}
        <div className="flex flex-col md:flex-row md:flex-wrap items-start justify-center gap-6 text-sm md:text-base text-left">
          {setting?.phoneNumber && (
            <div className="flex items-start gap-2 opacity-90">
              <Phone size={18} className="flex-shrink-0 mt-0.5" />
              <span>{setting?.phoneNumber}</span>
            </div>
          )}
          {setting?.email && (
            <div className="flex items-start gap-2 opacity-90">
              <Mail size={18} className="flex-shrink-0 mt-0.5" />
              <span>{setting?.email}</span>
            </div>
          )}
          {setting?.address && (
            <div className="flex items-start gap-2 opacity-90">
              <MapPin size={18} className="flex-shrink-0 mt-0.5" />
              <span>{setting?.address}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm md:text-base">
          {setting?.facebook && (
            <a
              href={setting?.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <Facebook size={20} /> Facebook
            </a>
          )}
          {setting?.instagram && (
            <a
              href={setting?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors flex items-center gap-2"
            >
              <Instagram size={20} /> Instagram
            </a>
          )}
          {setting?.twitter && (
            <a
              href={setting?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors flex items-center gap-2"
            >
              <Twitter size={20} /> Twitter
            </a>
          )}
          {setting?.facebookGroup && (
            <a
              href={setting?.facebookGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors flex items-center gap-2"
            >
              <Users size={20} /> Facebook Group
            </a>
          )}
          {setting?.youtube && (
            <a
              href={setting?.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <Youtube size={20} /> YouTube
            </a>
          )}
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-black px-6 md:px-10 py-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400 text-center md:text-left">
          <p>
            © {currentYear}{" "}
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {setting?.name}
            </a>
            . All rights reserved.
          </p>

          <p className="flex items-center gap-2">
            ⚙️ Developed by{" "}
            <a
              href="https://www.artistycode.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              ArtistyCode Studio
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
