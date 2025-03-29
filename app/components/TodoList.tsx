'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { XCircle } from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  category: string;
  initialItems?: TodoItem[];
}

export default function TodoList({ category, initialItems = [] }: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Handle client-side initialization from localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(`todos-${category}`);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, [category]);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`todos-${category}`, JSON.stringify(items));
    }
  }, [items, category, isClient]);

  const addItem = () => {
    if (newItemText.trim() === '') return;
    
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false
    };
    
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-pink-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-center text-pink-500">
          {category.charAt(0).toUpperCase() + category.slice(1)} List
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Add new ${category.toLowerCase()} item...`}
            className="flex-grow border-pink-200 focus-visible:ring-pink-300"
          />
          <Button 
            onClick={addItem}
            className="bg-pink-500 hover:bg-pink-600 text-white transition-colors"
          >
            Add
          </Button>
        </div>
        
        <ScrollArea className="h-[300px] w-full pr-4">
          {(!isClient || items.length > 0) ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li 
                  key={item.id} 
                  className="px-3 py-1 rounded-lg bg-white border border-pink-100 flex justify-between items-center group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="text-pink-500 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                    />
                    <label 
                      htmlFor={item.id}
                      className={`${item.completed ? 'line-through text-gray-400' : 'text-gray-700'} transition-colors`}
                    >
                      {item.text}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon" 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <XCircle className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-center">
              <p className="text-muted-foreground">
                No {category.toLowerCase()} items yet. Add some!
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 