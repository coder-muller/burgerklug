"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname } from "next/navigation"

export interface NavItem {
    label: string
    value: string
    href: string
}

interface HeaderNavigationProps {
    items: NavItem[]
}

export function HeaderNavigation({ items }: HeaderNavigationProps) {
    const pathname = usePathname()

    return (
        <div className="border-b border-border bg-background">
            <Tabs className="w-full" value={pathname.split("/")[1]}>
                <ScrollArea>
                    <TabsList className="mb-0 h-auto gap-0 rounded-none border-0 bg-transparent px-6 py-0 text-foreground">
                        {items.map((item) => (
                            <Link href={item.href} key={item.value}>
                                <TabsTrigger
                                    value={item.value}
                                    className="relative rounded-none border-0 px-3 py-2 text-sm font-medium text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-px after:h-0.5 hover:bg-transparent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:bg-foreground data-[state=active]:hover:bg-transparent"
                                >
                                    {item.label}
                                </TabsTrigger>
                            </Link>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="hidden md:block" />
                </ScrollArea>
            </Tabs>
        </div>
    )
}

