import { Component, OnInit, OnDestroy } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

interface Movie {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  directors: Array<{ name: string; bio?: string; birth?: string }>;
  genre: Array<{ name: string; description?: string }>;
}

@Component({
  selector: 'app-movie-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  private subscriptions = new Subscription();
  
  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Loads all movies from the API
   */
  private loadMovies(): void {
  const moviesSub = this.fetchApiData.getAllMovies().subscribe({
    next: (movies: Movie[]) => {
      this.movies = movies;
      console.log('Movies loaded:', this.movies.length);
      console.log('First movie data:', this.movies[0]);
      console.log('First movie genres:', this.movies[0]?.genre);
    },
    error: (error) => {
      console.error('Error loading movies:', error);
      this.showNotification('Failed to load movies. Please try again.');
    }
  });
  
  this.subscriptions.add(moviesSub);
}

  /**
   * Displays the movie description in a snackbar
   */
  showDescription(movie: Movie): void {
    if (!movie.description) {
      this.showNotification('No description available');
      return;
    }
    
    this.snackBar.open(movie.description, 'Close', { 
      duration: 5000,
      panelClass: ['description-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Displays director information in a snackbar
   */
  showDirectorInfo(movie: Movie): void {
    if (!movie.directors || movie.directors.length === 0) {
      this.showNotification('No director information available');
      return;
    }

    const director = movie.directors[0];
    const message = director.bio 
      ? `${director.name}: ${director.bio}`
      : `Director: ${director.name}`;
    
    this.snackBar.open(message, 'Close', { 
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Displays genre information in a snackbar
   */
  showGenreInfo(movie: Movie): void {
    if (!movie.genre || movie.genre.length === 0) {
      this.showNotification('No genre information available');
      return;
    }

    const genre = movie.genre[0];
    const message = genre.description
      ? `${genre.name}: ${genre.description}`
      : `Genre: ${genre.name}`;
    
    this.snackBar.open(message, 'Close', { 
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Adds a movie to the user's favorites
   */
  addToFavorites(movieId: string): void {
    if (!movieId) {
      console.error('Invalid movie ID');
      return;
    }

    const favoriteSub = this.fetchApiData.addFavoriteMovie(movieId).subscribe({
      next: () => {
        this.showNotification('Movie added to favorites!');
        console.log('Movie added to favorites:', movieId);
      },
      error: (error) => {
        console.error('Error adding to favorites:', error);
        const errorMessage = error.status === 409 
          ? 'Movie is already in your favorites'
          : 'Failed to add movie to favorites';
        this.showNotification(errorMessage);
      }
    });

    this.subscriptions.add(favoriteSub);
  }

  /**
   * Navigates to the user profile page
   */
  navigateToProfile(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const username = userData.username || userData.username;

        if (username) {
          console.log('Navigating to profile:', username);
          this.router.navigate(['/users', username]);
        } else {
          console.error('No username found in user data');
          this.showNotification('Unable to load profile. Please log in again.');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.showNotification('Error loading profile.');
      }
    } else {
      console.log('No user data found in localStorage');
      this.showNotification('Please log in to view your profile.');
      this.router.navigate(['/welcome']);
    }
  }

  /**
   * Helper method to show notifications
   */
  private showNotification(message: string, action: string = 'OK', duration: number = 2000): void {
    this.snackBar.open(message, action, { 
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Checks if a movie has valid image URL
   */
  hasValidImage(movie: Movie): boolean {
    return !!movie.imageUrl && movie.imageUrl.trim() !== '';
  }

  /**
   * Gets the first director's name or returns 'Unknown'
   */
  getDirectorName(movie: Movie): string {
    return movie.directors?.[0]?.name || 'Unknown';
  }

  /**
   * Gets a comma-separated list of genre names
   */
  getGenreNames(movie: Movie): string {
    return movie.genre?.map(g => g.name).join(', ') || 'N/A';
  }
}
