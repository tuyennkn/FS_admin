"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { logoutUser } from "@/features/auth/authSlice"

export function NavUser() {
  const { isMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  // Default user info if not authenticated
  const userInfo = user || {
    fullname: "Admin", 
    email: "admin@example.com",
    username: "admin"
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      router.push('/login')
    } catch (error: any) {
      console.error("Logout error:", error)
      // Even if logout fails, redirect to login page
      router.push('/login')
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white data-[state=open]:text-gray-900 data-[state=open]:shadow-lg data-[state=open]:border data-[state=open]:border-gray-200/50 hover:bg-sidebar-accent/80 transition-all duration-300 rounded-xl group/user relative overflow-hidden h-12 px-4 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
            >
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold text-base text-sidebar-foreground group-hover/user:text-sidebar-accent-foreground transition-colors">{userInfo?.fullname || userInfo?.username}</span>
                <span className="truncate text-xs text-sidebar-muted-foreground font-medium">{userInfo?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-5 opacity-60 group-hover/user:opacity-100 group-hover/user:scale-110 transition-all duration-300" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-2xl border border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-4 px-4 py-4 text-left border-b border-gray-100">
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold text-base text-gray-900">{userInfo?.fullname || userInfo?.username}</span>
                  <span className="truncate text-sm text-gray-600 font-medium">{userInfo?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <div className="p-3">
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-all duration-200 cursor-pointer group/item h-12 px-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 group-hover/item:bg-amber-200 transition-colors mr-3">
                    <Sparkles className="size-4 text-amber-600 group-hover/item:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="font-semibold">Upgrade to Pro</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-3 bg-gray-100" />
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem className="rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-all duration-200 cursor-pointer group/item h-12 px-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 group-hover/item:bg-emerald-200 transition-colors mr-3">
                    <BadgeCheck className="size-4 text-emerald-600 group-hover/item:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="font-semibold">Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 cursor-pointer group/item h-12 px-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 group-hover/item:bg-blue-200 transition-colors mr-3">
                    <CreditCard className="size-4 text-blue-600 group-hover/item:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="font-semibold">Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl hover:bg-orange-50 hover:text-orange-800 transition-all duration-200 cursor-pointer group/item h-12 px-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 group-hover/item:bg-orange-200 transition-colors mr-3">
                    <Bell className="size-4 text-orange-600 group-hover/item:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="font-semibold">Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-3 bg-gray-100" />
              <DropdownMenuItem className="rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer group/item text-red-600 h-12 px-3"
                onClick={handleLogout}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover/item:bg-red-200 transition-colors mr-3">
                  <LogOut className="size-4 text-red-600 group-hover/item:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-semibold">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
