'use client';

import { Movie } from "@/app/types/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Plus, Minus, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  showDelete?: boolean;
  isSharedLayout?: boolean;
  onToggleWatched?: (id: string, selectedUsers: string[]) => void;
  onToggleToWatch?: (id: string) => void;
}

export default function MovieCard({ 
  movie, 
  onDelete, 
  isUpdating, 
  showDelete = true,
  isSharedLayout = false,
  onToggleWatched,
  onToggleToWatch,
}: MovieCardProps) {

  const handleToggleWatched = (selectedUsers: string[]) => {
    onToggleWatched?.(movie.id, selectedUsers);
    movie.watched_by = selectedUsers;
  };

  const handleToggleToWatch = () => {
    onToggleToWatch?.(movie.id);
  };

  return (
    <Card className="w-[120px] sm:w-[140px]">
      <CardContent className="p-0">
        <div className="aspect-square w-full overflow-hidden">
          {movie.image_url ? (
            <Image 
              src={movie.image_url} 
              alt={movie.title}
              className="h-full w-full object-cover"
              width={120}
              height={120}
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <div className="w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="font-medium text-xs line-clamp-2">{movie.title}</h4>
              </TooltipTrigger>
              <TooltipContent>
                <p>{movie.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground">{movie.year}</p>
          {isSharedLayout && (
            <div className="mt-1 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    disabled={isUpdating}
                  >
                    <Eye className={`h-4 w-4 ${movie.watched_by.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['kenny', 'nicole'].map((user) => (
                    <DropdownMenuItem
                      key={user}
                      onClick={() => handleToggleWatched([user])}
                    >
                      Watched by {user}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => handleToggleWatched(['kenny', 'nicole'])}
                  >
                    Watched by all
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleWatched([])}
                  >
                    Watched by none
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {movie.watched_by.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {movie.watched_by.join(', ')}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Watched by: {movie.watched_by.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            {onToggleToWatch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleToWatch}
                disabled={isUpdating}
                className="p-1 h-6"
              >
                {movie.to_watch ? (
                  <Minus className="h-4 w-4 text-green-500" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
            {showDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUpdating}
                    className="p-1 h-6"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this movie from the list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(movie.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 