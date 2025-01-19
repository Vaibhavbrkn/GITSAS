'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard,  Plus,  Presentation } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import useProject from "@/hooks/use-project"

const items = [
    {
        title:'Dashboard',
        url:'/dashboard',
        icon:LayoutDashboard,
    },
    {
        title:'Q&A',
        url:'/qa',
        icon:Bot,
    },
    {
        title:'Meetings',
        url:'/meetings',
        icon:Presentation,
    },
    // {
    //     title:'Billing',
    //     url:'/billing',
    //     icon:CreditCard,
    // },
]



export function AppSidebar(){
    const pathname = usePathname()
    const {open} = useSidebar()
    const {projects, projectId, setProjectId} = useProject()
    return (
        <Sidebar collapsible="icon" variant="floating" >
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    {open && (
                        <h1 className="text-x1 font-bold text-primary/80">
                            GITSAS
                        </h1>
                    )}

                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarContent>
                        <SidebarMenu>
                            {items.map(item=>{
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white':pathname === item.url
                                            }, 'list-none')}>
                                                <item.icon/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map(project=>{
                                return(
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={()=>setProjectId(project.id)}>
                                                <div className={cn(
                                                    'rounded-8m border size-6 flex items-center justify-center text-8m bg-white text-primary',
                                                    {
                                                        'bg-primary text-white':project.id === projectId
                                                    }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                {project.name}
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>
                            {open &&(
                                <SidebarMenuItem>
                                    <Link href='/create'>
                                        <Button size='sm' variant={'outline'} className="w-fit">
                                            <Plus/>
                                            Create Project
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}