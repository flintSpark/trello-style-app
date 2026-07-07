import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'done';
  assignedTo: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  private socket: Socket;
  
  // Writable signal holding our client-side task array state
  tasks = signal<Task[]>([]);
  activities = signal<any[]>([]);

  constructor() {
    // Connect to the local WebSocket server
    this.socket = io('http://localhost:3000');

    // Fetch initial baseline data stream via HTTP
    this.fetchInitialTasks();

    // Listen for live WebSocket broadcasts from the server
    this.socket.on('taskCreated', (newTask: Task) => {
      this.tasks.update((currentTasks) => [...currentTasks, newTask]);
    });

    this.socket.on('taskUpdated', (updatedTask: Task) => {
      this.tasks.update((currentTasks) =>
        currentTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });
    
    this.http.get<any[]>('http://localhost:3000/api/activities').subscribe({
      next: (history) => this.activities.set(history)
    });

    this.socket.on('activityLogged', (log: any) => {
      this.activities.update((current) => [log, ...current.slice(0, 9)]); // Keep rolling top 10 items
    });

    this.socket.on('boardPurged', () => {
      this.tasks.set([]);      // Clear task signals
      this.activities.set([]); // Clear audit trails
    });

  }

  private fetchInitialTasks(): void {
    this.http.get<Task[]>('http://localhost:3000/api/tasks').subscribe({
      next: (initialTasks) => this.tasks.set(initialTasks)
    });
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>('http://localhost:3000/api/tasks', task);
  }

  updateTaskStatus(id: string, status: string, updatedBy: string): Observable<Task> {
    // Send both the next status state and the user name inside the payload object
    return this.http.patch<Task>(`http://localhost:3000/api/tasks/${id}`, { status, updatedBy });
  }

  getAnalytics(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/analytics/stats');
  }

  purgeEntireBoard(): Observable<any> {
  return this.http.delete('http://localhost:3000/api/tasks');
  }

}
