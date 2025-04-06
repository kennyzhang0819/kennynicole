export type Movie = {
  id: string;
  imdb_id: string;
  title: string;
  year: number;
  image_url: string;
  watched_by: string[];
  runtime?: string;
  director?: string;
  genre?: string;
  to_watch: boolean;
};
