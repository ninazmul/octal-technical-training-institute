"use client";

import { useEffect, useMemo, useState } from "react";
import { ISetting } from "@/lib/database/models/setting.model";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  id: string;
};

export default function AboutContent({ settings }: { settings: ISetting }) {
  const themeColor = settings.theme || "#000000";
  const [activeSection, setActiveSection] = useState("");

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [];

    if (settings.description) items.push({ label: "About", id: "about-section" });
    if (settings.email || settings.phoneNumber || settings.address)
      items.push({ label: "Contact", id: "contact-section" });

    if (
      settings.facebook ||
      settings.instagram ||
      settings.twitter ||
      settings.youtube ||
      settings.facebookGroup
    )
      items.push({ label: "Social", id: "social-section" });

    return items;
  }, [settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const proseClasses = `
    prose prose-base max-w-none dark:prose-invert
    prose-headings:font-semibold
    prose-p:text-gray-700 dark:prose-p:text-gray-300
    prose-p:leading-relaxed
  `;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-4xl md:text-5xl font-extrabold mb-16"
          style={{ color: themeColor }}
        >
          About {settings.name}
        </motion.h1>

        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-4">
                Sections
              </h3>

              <nav className="grid grid-cols-3 gap-2">
                {navItems.map((item) => {
                  const active = activeSection === item.id;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="px-3 py-2 rounded-md text-sm transition"
                      style={{
                        background: active ? `${themeColor}20` : "transparent",
                        color: active ? themeColor : "",
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-4">
            {/* About */}
            {settings.description && (
              <motion.section
                id="about-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: themeColor }}
                >
                  About Us
                </h2>

                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: settings.description }}
                />
              </motion.section>
            )}

            {/* Contact */}
            {(settings.email || settings.phoneNumber || settings.address) && (
              <motion.section
                id="contact-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-8"
                  style={{ color: themeColor }}
                >
                  Contact Information
                </h2>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  {settings.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} />
                      {settings.email}
                    </div>
                  )}

                  {settings.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} />
                      {settings.phoneNumber}
                    </div>
                  )}

                  {settings.address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={18} />
                      {settings.address}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Social */}
            {(settings.facebook ||
              settings.instagram ||
              settings.twitter ||
              settings.youtube ||
              settings.facebookGroup) && (
              <motion.section
                id="social-section"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 border rounded-xl p-8 shadow-sm"
              >
                <h2
                  className="text-2xl font-semibold mb-8"
                  style={{ color: themeColor }}
                >
                  Follow Us
                </h2>

                <div className="flex flex-wrap gap-4">
                  {settings.facebook && (
                    <a href={settings.facebook} target="_blank">
                      <Facebook />
                    </a>
                  )}

                  {settings.instagram && (
                    <a href={settings.instagram} target="_blank">
                      <Instagram />
                    </a>
                  )}

                  {settings.twitter && (
                    <a href={settings.twitter} target="_blank">
                      <Twitter />
                    </a>
                  )}

                  {settings.youtube && (
                    <a href={settings.youtube} target="_blank">
                      <Youtube />
                    </a>
                  )}

                  {settings.facebookGroup && (
                    <a href={settings.facebookGroup} target="_blank">
                      <Users />
                    </a>
                  )}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}