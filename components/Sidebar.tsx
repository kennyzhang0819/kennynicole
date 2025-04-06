'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, Heart, List, Home, Menu, X } from "lucide-react";
import { cn } from '@/app/lib/utils';
import { Button } from "@/components/ui/button";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const sidebarItems: SidebarItem[] = [
    { name: 'Movies', path: '/movies', icon: <Film className="w-5 h-5" /> },
    { name: 'Kenny Movies', path: '/movies/kenny', icon: <List className="w-5 h-5" /> },
    { name: 'Nicole Movies', path: '/movies/nicole', icon: <List className="w-5 h-5" /> },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-30 bg-background shadow-sm border rounded-md"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-20"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Card className={cn(
        "h-screen border-r rounded-none shadow-sm",
        "fixed lg:static z-20 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-64"
      )}>
        <div className="flex flex-col h-full">
          
          <ScrollArea className="flex-1">
            <CardContent className="p-4">
              <nav>
                <ul className="space-y-2">
                  {sidebarItems.map((item) => (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                          pathname === item.path 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </CardContent>
          </ScrollArea>
          
          <div className="p-6 border-t flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span className="text-sm">Made with love</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 