"use client";

import { ISetting } from "@/lib/database/models/setting.model";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getSetting } from "@/lib/actions";
import { headerLinks } from "@/constants";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaFacebookF, FaUsers } from "react-icons/fa6";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const [setting, setSetting] = useState<ISetting | null>(null);
  const themeColor = setting?.theme || "#000000";

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
        className="px-6 md:px-10 py-12 md:py-20 grid grid-cols-1 md:grid-cols-4 gap-10"
      >
        {/* Logo/About */}
        <div className="space-y-4 text-center md:text-left">
          <Image
            src={setting?.logo || "/assets/images/logo.png"}
            alt="Logo"
            width={150}
            height={150}
            priority
            className="mx-auto md:mx-0 rounded-md"
          />
          <h2 className="text-xl font-bold">{setting?.name}</h2>
          {setting?.description && (
            <div
              className="text-sm opacity-90"
              dangerouslySetInnerHTML={{ __html: setting?.description }}
            />
          )}
          {/* Social Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            {setting?.facebook && (
              <a
                href={setting.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
              >
                <FaFacebookF size={20} />
              </a>
            )}

            {setting?.instagram && (
              <a
                href={setting.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
              >
                <FaInstagram size={20} />
              </a>
            )}

            {setting?.twitter && (
              <a
                href={setting.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
              >
                <FaTwitter size={20} />
              </a>
            )}

            {setting?.facebookGroup && (
              <a
                href={setting.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
              >
                <FaUsers size={20} />
              </a>
            )}

            {setting?.youtube && (
              <a
                href={setting.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary rounded-full p-1 flex items-center justify-center transition-transform transform hover:scale-125"
              >
                <FaYoutube size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">যোগাযোগ</h3>
          {setting?.phoneNumber && (
            <div className="flex items-start gap-2 opacity-90">
              <Phone size={16} /> <span>{setting.phoneNumber}</span>
            </div>
          )}
          {setting?.email && (
            <div className="flex items-start gap-2 opacity-90">
              <Mail size={16} /> <span>{setting.email}</span>
            </div>
          )}
          {setting?.address && (
            <div className="flex items-start gap-2 opacity-90">
              <MapPin size={16} /> <span>{setting.address}</span>
            </div>
          )}
        </div>

        {/* Popular Courses */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">জনপ্রিয় কোর্স</h3>
          {/* {setting?.features?.slice(0, 3).map((course, idx) => (
            <p key={idx} className="opacity-90">{course.title}</p>
          ))} */}
        </div>

        {/* Others */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">অন্যান্য</h3>
          {headerLinks.map((link, idx) => (
            <p key={idx} className="opacity-90">
              {link.label}
            </p>
          ))}
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
              className="hover:text-white"
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
              className="hover:text-white"
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
