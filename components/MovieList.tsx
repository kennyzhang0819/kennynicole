'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XCircle, Search, Loader2, CheckCircle2 } from "lucide-react";
import { Movie } from "@/app/types/types";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MovieCard from './MovieCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Runtime?: string;
  Director?: string;
  Genre?: string;
}

interface OmdbSearchResponse {
  Search: OmdbMovie[];
  totalResults: string;
  Response: string;
  Error?: string;
}

interface OmdbMovieDetails {
  Runtime: string;
  Director: string;
  Genre: string;
  Response: string;
  Error?: string;
}


export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OmdbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchMovies = async () => {
      setIsClient(true);
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setMovies(data);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const searchMovies = async () => {
    if (searchQuery.trim() === '') return;
    
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_MOVIE_API_KEY;
      const searchResponse = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`);
      const data = await searchResponse.json() as OmdbSearchResponse;
      
      if (data.Response === 'True') {
        // Fetch additional details for each movie
        const detailedMovies = await Promise.all(
          data.Search.map(async (movie) => {
            const detailsResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`);
            const details = await detailsResponse.json() as OmdbMovieDetails;
            
            if (details.Response === 'True') {
              return {
                ...movie,
                Runtime: details.Runtime,
                Director: details.Director,
                Genre: details.Genre
              };
            }
            return movie;
          })
        );
        
        setSearchResults(detailedMovies);
      } else {
        setError(data.Error || 'No movies found. Try another search term.');
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  const addMovieFromSearch = async (omdbMovie: OmdbMovie) => {
    if (movies.some(m => m.id === omdbMovie.imdbID)) {
      return;
    }

    // Convert OmdbMovie to Movie type
    const movie: Movie = {
      id: uuidv4(),
      imdb_id: omdbMovie.imdbID,
      title: omdbMovie.Title,
      year: parseInt(omdbMovie.Year) || 0,
      image_url: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '',
      watched_by: [],
      runtime: omdbMovie.Runtime,
      director: omdbMovie.Director,
      genre: omdbMovie.Genre,
      to_watch: true
    };
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('movies')
        .insert(movie);

      if (error) {
        throw error;
      }

      // Update local state
      setMovies([...movies, movie]);
    } catch (err) {
      console.error('Error adding movie:', err);
      setError('Failed to add movie');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMovie = async (id: string) => {
    setIsUpdating(true);
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMovies(movies.filter(movie => movie.id !== id));
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Failed to delete movie');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleWatched = async (id: string, selectedUsers: string[]) => {
    setIsUpdating(true);
    try {
      // Find the movie and update its watched_by status
      const movie = movies.find(m => m.id === id);
      if (!movie) return;

      // Update in Supabase
      const { error } = await supabase
        .from('movies')
        .update({ watched_by: selectedUsers })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMovies(movies.map(m => 
        m.id === id ? { ...m, watched_by: selectedUsers } : m
      ));
    } catch (err) {
      console.error('Error updating watch status:', err);
      setError('Failed to update watch status');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleToWatch = async (id: string) => {
    setIsUpdating(true);
    try {
      // Find the movie and toggle its to_watch status
      const movie = movies.find(m => m.id === id);
      if (!movie) return;

      const newToWatchStatus = !movie.to_watch;

      // Update in Supabase
      const { error } = await supabase
        .from('movies')
        .update({ to_watch: newToWatchStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMovies(movies.map(m => 
        m.id === id ? { ...m, to_watch: newToWatchStatus } : m
      ));
    } catch (err) {
      console.error('Error updating to-watch status:', err);
      setError('Failed to update to-watch status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold">Movie List</h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold">Search Movies</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for movies..."
              />
            </div>
            
            <Button 
              onClick={searchMovies}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          
          {error && (
            <p className="mt-4 text-destructive">{error}</p>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Search Results</h3>
              <ScrollArea className="h-[300px] rounded-md p-4">
                <div className="flex flex-wrap gap-4 justify-center">
                  {searchResults.map((movie) => (
                    <Card 
                      key={movie.imdbID} 
                      className="cursor-pointer hover:shadow-md transition-all w-[120px] sm:w-[140px]"
                      onClick={() => addMovieFromSearch(movie)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square w-full overflow-hidden">
                          {movie.Poster && movie.Poster !== 'N/A' ? (
                            <img 
                              src={movie.Poster} 
                              alt={movie.Title}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardContent className="p-2">
                        <div className="w-full">
                          <h4 className="font-medium text-xs line-clamp-1">{movie.Title}</h4>
                          <p className="text-xs text-muted-foreground">{movie.Year}</p>
                          <p className="text-xs text-primary mt-1">Click to add</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-center bg-muted rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p className="text-muted-foreground">Loading your movies...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-8">
            {/* Unwatched Movies Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">To Watch</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {movies.filter(movie => movie.to_watch).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onToggleWatched={toggleWatched}
                    onDelete={deleteMovie}
                    isUpdating={isUpdating}
                    isSharedLayout={true}
                    onToggleToWatch={toggleToWatch}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Watched Movies Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Watched</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {movies.filter(movie => (movie.watched_by || []).includes('kenny')).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onToggleWatched={toggleWatched}
                    onDelete={deleteMovie}
                    isUpdating={isUpdating}
                    isSharedLayout={true}
                    onToggleToWatch={toggleToWatch}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No movies added yet. Search for movies and add them to your collection!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 