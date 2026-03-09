"use client"

import { Plus, RefreshCw, Download, Settings, Building2, ClipboardList, Users, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()
  return (
    <div className="flex items-center space-x-2">
      <Button className="cursor-pointer" onClick={() => router.push("/intelligence")}>
        <Plus className="h-4 w-4 mr-2" />
        Add Signal
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Navigate
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/clients")}>
            <Handshake className="h-4 w-4 mr-2" />
            Clients
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/crm")}>
            <Building2 className="h-4 w-4 mr-2" />
            CRM / Prospects
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/decisions")}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Decision Log
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/team")}>
            <Users className="h-4 w-4 mr-2" />
            Team Workload
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
