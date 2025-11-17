import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FetchApiDataService } from '../fetch-api-data.service';

@Component({
  selector: 'app-user-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './user-login-form.component.html',
  styleUrl: './user-login-form.component.scss',
})

export class UserLoginFormComponent implements OnInit {

  @Input() userData = { username: '', password: '' };

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialogRef: MatDialogRef<UserLoginFormComponent>,
    public snackBar: MatSnackBar,
    public router: Router
  ) { }

  ngOnInit(): void { }

  userLogin(): void {
  this.fetchApiData.userLogin(this.userData).subscribe({
    next: (result) => {
      console.log('Login result:', result);
      
      localStorage.setItem('token', result.token);
      localStorage.setItem('username', result.user.Username || result.user.username);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      this.dialogRef.close();
      this.snackBar.open('Login successful', 'OK', {
        duration: 2000,
      });
      
      this.router.navigate(['movies']);
    },
    error: (error) => {
      console.error('Login error:', error);
      this.snackBar.open('Login failed. Please check your credentials.', 'OK', {
        duration: 2000,
      });
    }
  });
}
}
