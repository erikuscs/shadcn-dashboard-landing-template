"use client"

import * as React from "react"
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  KanbanSquare,
  Users,
  Wrench,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Erik Herring",
    email: "erik.herring@sustainablegaps.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Mission Control",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Intelligence",
          url: "/intelligence",
          icon: AlertTriangle,
        },
        {
          title: "Roadmap",
          url: "/roadmap",
          icon: Map,
        },
        {
          title: "Projects",
          url: "/projects",
          icon: KanbanSquare,
        },
        {
          title: "Team",
          url: "/team",
          icon: Users,
        },
        {
          title: "Tools",
          url: "/tools",
          icon: Wrench,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mission Control</span>
                  <span className="truncate text-xs">Sustainable Gaps</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
