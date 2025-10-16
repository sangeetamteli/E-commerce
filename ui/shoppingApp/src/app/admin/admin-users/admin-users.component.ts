import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/service/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  editingUser: User | null = null;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Failed to load users', err),
    });
  }

  editUser(user: User) {
    this.editingUser = { ...user };
  }

  saveUser() {
    if (!this.editingUser) return;
    this.userService.updateUser(this.editingUser).subscribe({
      next: () => {
        this.loadUsers();
        this.editingUser = null;
      },
      error: (err) => console.error('Update failed', err),
    });
  }

  cancelEdit() {
    this.editingUser = null;
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Delete failed', err),
    });
  }
}
