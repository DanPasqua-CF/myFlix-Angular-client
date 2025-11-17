import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FetchApiDataService } from '../fetch-api-data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-profile',
  standalone: true,   // ✅ REQUIRED
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ]
})

export class UserProfileComponent implements OnInit, OnDestroy {
  user: any = {};
  favoriteMovies: any[] = [];

  private sub?: Subscription;

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.fetchApiData.getUser().subscribe(user => {
      this.user = user;

      const favIds = user.favoriteMovies || [];

      this.fetchApiData.getAllMovies().subscribe(movies => {
        this.favoriteMovies = movies
          .filter((m: any) => favIds.includes(m._id))
          .sort((a: any, b: any) => a.title.localeCompare(b.title));
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
