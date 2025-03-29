'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { XCircle } from "lucide-react";
import { Label } from "@/app/components/ui/label";

interface Movie {
  id: string;
  name: string;
  year: string;
  imageUrl: string;
}

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [newMovie, setNewMovie] = useState<Omit<Movie, 'id'>>({
    name: '',
    year: '',
    imageUrl: ''
  });
  const [isClient, setIsClient] = useState(false);

  // Handle client-side initialization from localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('movies');
    if (saved) {
      setMovies(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever movies change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('movies', JSON.stringify(movies));
    }
  }, [movies, isClient]);

  const addMovie = () => {
    if (newMovie.name.trim() === '') return;
    
    const movie: Movie = {
      id: Date.now().toString(),
      ...newMovie
    };
    
    setMovies([...movies, movie]);
    setNewMovie({ name: '', year: '', imageUrl: '' });
  };

  const deleteMovie = (id: string) => {
    setMovies(movies.filter(movie => movie.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addMovie();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMovie(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">Movie List</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Add New Movie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Movie Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={newMovie.name}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter movie name"
              className="border-pink-200 focus-visible:ring-pink-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="text"
              value={newMovie.year}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Release year"
              className="border-pink-200 focus-visible:ring-pink-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Movie Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              value={newMovie.imageUrl}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Paste image URL"
              className="border-pink-200 focus-visible:ring-pink-300"
            />
          </div>
        </div>
        
        <Button 
          onClick={addMovie}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white transition-colors w-full sm:w-auto"
        >
          Add Movie
        </Button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Movies</h2>
        
        {(!isClient || movies.length > 0) ? (
          <div className="grid grid-cols-1 gap-4">
            {movies.map((movie) => (
              <div 
                key={movie.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-pink-100 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="h-40 w-full sm:h-24 sm:w-20 flex-shrink-0 overflow-hidden rounded-md mb-2 sm:mb-0">
                  {movie.imageUrl ? (
                    <img 
                      src={movie.imageUrl} 
                      alt={movie.name}
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-lg text-gray-800">{movie.name}</h3>
                  <p className="text-gray-500">{movie.year}</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon" 
                  onClick={() => deleteMovie(movie.id)}
                  className="text-gray-400 hover:text-red-500 sm:self-auto self-end"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No movies added yet. Add some to your collection!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 