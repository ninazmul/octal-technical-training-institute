"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSetting } from "@/lib/actions/setting.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Megaphone,
  Award,
  ImageIcon,
  UserPlus,
  ShieldCheck,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator"],
  },
  {
    title: "Courses",
    url: "/dashboard/courses",
    icon: GraduationCap, // clearer than BookOpen
    roles: ["admin", "moderator"],
  },
  {
    title: "Registrations",
    url: "/dashboard/registrations",
    icon: ClipboardList, // better for tracking entries
    roles: ["admin", "moderator"],
  },
  {
    title: "Notices",
    url: "/dashboard/notices",
    icon: Megaphone, // announcements = loudspeaker
    roles: ["admin"],
  },
  {
    title: "Success Stories",
    url: "/dashboard/success-stories",
    icon: Award, // achievement = stronger signal
    roles: ["admin"],
  },
  {
    title: "Gallery",
    url: "/dashboard/gallery",
    icon: ImageIcon, // cleaner & modern
    roles: ["admin"],
  },
  {
    title: "Trainers Applications",
    url: "/dashboard/trainers",
    icon: UserPlus, // onboarding / application intent
    roles: ["admin"],
  },
  {
    title: "Admins",
    url: "/dashboard/admins",
    icon: ShieldCheck, // authority + verified
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

const AdminSidebar = ({ role }: { role?: string }) => {
  const currentPath = usePathname();
  const [settings, setSettings] = useState<ISettingSafe | null>(null);

  useEffect(() => {
    (async () => {
      const setting = await getSetting();
      setSettings(setting);
    })();
  }, []);

  const moderatorAllowed = ["Dashboard", "Courses", "Registrations"];

  return (
    <Sidebar
      className="text-primary font-semibold font-serif"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel>
            <div className="relative w-full h-10 rounded-md overflow-hidden bg-primary">
              <Link href={"/"}>
                <Image
                  src={settings?.logo || "/assets/images/logo.png"}
                  fill
                  className="object-contain rounded-md"
                  alt={settings?.name || "Logo"}
                />
              </Link>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarItems
                .filter((item) => {
                  if (role === "Admin") {
                    return item.roles.includes("admin");
                  } else if (role === "Moderator") {
                    return (
                      item.roles.includes("admin") &&
                      moderatorAllowed.includes(item.title)
                    );
                  }
                  return false;
                })
                .map((item) => {
                  const isActive =
                    item.url === "/dashboard"
                      ? currentPath === item.url
                      : currentPath === item.url ||
                        currentPath.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                            isActive ? "bg-primary text-white" : ""
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
