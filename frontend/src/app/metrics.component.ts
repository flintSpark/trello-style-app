import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { BoardService } from './board.service';
import { io, Socket } from 'socket.io-client'; // Added socket imports

interface StatGroup {
  _id: 'todo' | 'progress' | 'done';
  totalTasks: number;
  totalPoints: number;
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  template: `
    <div style="margin-top: 30px; padding: 20px; background: #222; color: #fff; border-radius: 4px; font-family: sans-serif;">
      <h3>Live Board Metrics (Automated MongoDB Aggregation)</h3>
      
      <div style="display: flex; gap: 30px; margin-bottom: 15px;">
        <div><strong>Total System Tasks:</strong> {{ totalTasksCount() }}</div>
        <div><strong>Total Backlog Points:</strong> {{ totalSystemPoints() }}</div>
      </div>

      <div style="display: flex; gap: 20px;">
        @for (stat of rawStats(); track stat._id) {
          <div style="flex: 1; padding: 10px; background: #333; border-radius: 4px; border-left: 4px solid #007acc;">
            <strong style="text-transform: uppercase;">{{ stat._id }}</strong>
            <div>Tasks: {{ stat.totalTasks }}</div>
            <div>Story Points: {{ stat.totalPoints }}</div>
          </div>
        }
      </div>
    </div>
  `
})
export class MetricsComponent implements OnInit, OnDestroy {
  private boardService = inject(BoardService);
  private socket!: Socket;

  rawStats = signal<StatGroup[]>([]);

  totalTasksCount = computed(() => this.rawStats().reduce((acc, curr) => acc + curr.totalTasks, 0));
  totalSystemPoints = computed(() => this.rawStats().reduce((acc, curr) => acc + curr.totalPoints, 0));

  ngOnInit(): void {
    // 1. Run the initial baseline aggregation pull
    this.refreshMetrics();

    // 2. Connect to the socket server to listen for global mutations
    this.socket = io('http://localhost:3000');

    // 3. Automatically rerun the MongoDB pipeline whenever any client alters a task
    this.socket.on('taskCreated', () => this.refreshMetrics());
    this.socket.on('taskUpdated', () => this.refreshMetrics());
  }

  ngOnDestroy(): void {
    // Clean up socket connections if the component is destroyed
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  refreshMetrics(): void {
    this.boardService.getAnalytics().subscribe({
      next: (data) => this.rawStats.set(data as StatGroup[])
    });
  }
}
