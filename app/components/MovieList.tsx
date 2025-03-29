'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { XCircle, Search, Loader2 } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { Movie } from "@/app/types/types";
import { createClient } from "@/app/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OmdbSearchResponse {
  Search: OmdbMovie[];
  totalResults: string;
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
      const apiKey = process.env.NEXT_PUBLIC_MOVIE_API_KEY || '17d79a74';
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`);
      const data = await response.json() as OmdbSearchResponse;
      
      if (data.Response === 'True') {
        setSearchResults(data.Search);
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
    // Check if the movie already exists in the list
    if (movies.some(m => m.id === omdbMovie.imdbID)) {
      return;
    }

    // Convert OmdbMovie to Movie type
    const movie: Movie = {
      id: uuidv4(),
      title: omdbMovie.Title,
      year: parseInt(omdbMovie.Year) || 0,
      image_url: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '',
      watched: false
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

  const toggleWatched = async (id: string) => {
    setIsUpdating(true);
    try {
      // Find the movie and toggle its watched status
      const movie = movies.find(m => m.id === id);
      if (!movie) return;

      const updatedWatchedStatus = !movie.watched;

      // Update in Supabase
      const { error } = await supabase
        .from('movies')
        .update({ watched: updatedWatchedStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMovies(movies.map(m => 
        m.id === id ? { ...m, watched: updatedWatchedStatus } : m
      ));
    } catch (err) {
      console.error('Error updating watch status:', err);
      setError('Failed to update watch status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">Movie List</h1>
      
      <div className="bg-white">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Search Movies</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for movies..."
              className="border-pink-200 focus-visible:ring-pink-300"
            />
          </div>
          
          <Button 
            onClick={searchMovies}
            className="bg-pink-500 hover:bg-pink-600 text-white transition-colors"
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
          <p className="mt-4 text-red-500">{error}</p>
        )}
        
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3 text-gray-700">Search Results</h3>
            <ScrollArea className="h-[300px] rounded-md p-4">
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {searchResults.map((movie) => (
                  <div 
                    key={movie.imdbID} 
                    className="flex flex-col border rounded-md overflow-hidden hover:border-pink-300 transition-all cursor-pointer w-[80px] sm:w-[150px]"
                    onClick={() => addMovieFromSearch(movie)}
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      {movie.Poster && movie.Poster !== 'N/A' ? (
                        <img 
                          src={movie.Poster} 
                          alt={movie.Title}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <h4 className="font-medium text-xs text-gray-800 line-clamp-1">{movie.Title}</h4>
                      <p className="text-xs text-gray-500">{movie.Year}</p>
                      <p className="text-xs text-pink-500 mt-1">Click to add</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">My Movies</h2>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-center bg-gray-50 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p className="text-gray-500">Loading your movies...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                className={`flex items-center p-3 bg-white border rounded-lg hover:shadow-md transition-all group ${
                  movie.watched 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-pink-100'
                }`}
              >
                <div className="mr-4">
                  <Label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={movie.watched}
                      onChange={() => toggleWatched(movie.id)}
                      className={`w-5 h-5 rounded border-gray-300 focus:ring-pink-500 ${
                        movie.watched ? 'text-green-500' : 'text-pink-500'
                      }`}
                    />
                  </Label>
                </div>
                
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md mr-4">
                  {movie.image_url ? (
                    <div className="relative h-full w-full">
                      <img 
                        src={movie.image_url} 
                        alt={movie.title}
                        className={`h-full w-full object-cover ${
                          movie.watched ? 'opacity-70' : ''
                        }`}
                      />
                    </div>
                  ) : (
                    <div className={`h-full w-full flex items-center justify-center ${
                      movie.watched ? 'bg-gray-100' : 'bg-gray-200'
                    }`}>
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className={`font-medium text-sm ${
                    movie.watched ? 'text-gray-600' : 'text-gray-800'
                  }`}>{movie.title}</h3>
                  <p className="text-xs text-gray-500">{movie.year}</p>
                  {movie.watched && (
                    <p className="text-xs text-green-600 mt-1">✓ Watched</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMovie(movie.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-2 h-auto ml-2 rounded-full"
                  disabled={isUpdating}
                >
                  <XCircle className="h-6 w-6" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No movies added yet. Search for movies and add them to your collection!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 