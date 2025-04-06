'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Movie } from "@/app/types/types";
import { Loader2 } from "lucide-react";
import MovieCard from './MovieCard';

interface WatchedMoviesProps {
  user: string;
}

export default function WatchedMovies({ user }: WatchedMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .contains('watched_by', [user])
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setMovies(data);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleDelete = async (id: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMovies(movies.filter(movie => movie.id !== id));
    } catch (err) {
      console.error('Error deleting movie:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movies Watched by {user}</h1>
      
      {movies.length === 0 ? (
        <p className="text-muted-foreground">No movies watched yet.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onDelete={handleDelete}
              isUpdating={isUpdating}
              showDelete={false}
              isSharedLayout={false}
            />
          ))}
        </div>
      )}
    </div>
  );
} 