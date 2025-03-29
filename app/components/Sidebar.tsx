'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Film, Heart, List, Home, Menu, X } from "lucide-react";
import { cn } from '@/app/lib/utils';
import { Button } from "@/app/components/ui/button";

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
        className="lg:hidden fixed top-4 left-4 z-30 bg-white shadow-sm border border-pink-100 rounded-md"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-pink-600" />
        ) : (
          <Menu className="h-5 w-5 text-pink-600" />
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
        "h-screen border-r border-pink-100 rounded-none shadow-sm",
        "fixed lg:static z-20 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-64"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-pink-100">
            <h1 className="text-2xl font-bold text-pink-600">Kenny x Nicole</h1>
            <p className="text-muted-foreground text-sm">Track things together! ❤️</p>
          </div>
          
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
                            ? "bg-pink-100 text-pink-700" 
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
          
          <div className="p-6 border-t border-pink-100 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm">Made with love</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 