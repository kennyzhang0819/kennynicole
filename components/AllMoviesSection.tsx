'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Movie } from "@/app/types/types";
import MovieCard from './MovieCard';
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface AllMoviesSectionProps {
  onToggleWatched: (id: string, selectedUsers: string[]) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  onToggleToWatch: (id: string) => void;
}

const ITEMS_PER_PAGE = 25;

export default function AllMoviesSection({
  onToggleWatched,
  onDelete,
  isUpdating,
  onToggleToWatch,
}: AllMoviesSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  const fetchMovies = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let query = supabase
        .from('movies')
        .select('*');

      // Apply search filter if exists
      if (searchFilter) {
        // Check if the search term is a valid number for year search
        const isYearSearch = !isNaN(Number(searchFilter));
        if (isYearSearch) {
          query = query.or(`title.ilike.%${searchFilter}%,year.eq.${Number(searchFilter)}`);
        } else {
          // If not a valid number, only search in title
          query = query.ilike('title', `%${searchFilter}%`);
        }
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      setMovies(data || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [currentPage, searchFilter, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSort = (field: 'title' | 'year' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          type="text"
          placeholder="Filter movies..."
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toggleSort('title')}
            className="flex items-center gap-1"
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleSort('year')}
            className="flex items-center gap-1"
          >
            Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleSort('created_at')}
            className="flex items-center gap-1"
          >
            Date Added {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onToggleWatched={onToggleWatched}
                onDelete={onDelete}
                isUpdating={isUpdating}
                isSharedLayout={true}
                onToggleToWatch={onToggleToWatch}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={movies.length < ITEMS_PER_PAGE}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 