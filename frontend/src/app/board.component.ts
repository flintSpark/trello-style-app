import { Component, inject, signal, computed } from '@angular/core';
import { BoardService, Task } from './board.service';

@Component({
  selector: 'app-board',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Real-Time Collaboration Board</h2>

      <!-- Form Section to Add Tasks -->
      <div style="margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
        <h3>Create New Task</h3>
        <input #titleInput type="text" placeholder="Task Title" style="margin-right: 10px; padding: 5px;">
        <input #assigneeInput type="text" placeholder="Assignee Name" style="margin-right: 10px; padding: 5px;">
        <button (click)="addNewTask(titleInput.value, assigneeInput.value); titleInput.value=''; assigneeInput.value=''">
          Add Task
        </button>
      </div>

      <!-- Kanban Columns Layout -->
      <div style="display: flex; gap: 20px;">
        
        <!-- Todo Column -->
        <div style="flex: 1; background: #eaeaea; padding: 15px; border-radius: 4px;">
          <h3>To Do</h3>
          @for (task of todoTasks(); track task._id) {
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h4>{{ task.title }}</h4>
              <p>Assigned to: {{ task.assignedTo }}</p>
              <button (click)="moveTask(task._id!, 'progress')">Start Work</button>
            </div>
          }
        </div>

        <!-- Progress Column -->
        <div style="flex: 1; background: #e2f0fe; padding: 15px; border-radius: 4px;">
          <h3>In Progress</h3>
          @for (task of progressTasks(); track task._id) {
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h4>{{ task.title }}</h4>
              <p>Assigned to: {{ task.assignedTo }}</p>
              <button (click)="moveTask(task._id!, 'done')">Complete</button>
            </div>
          }
        </div>

        <!-- Done Column -->
        <div style="flex: 1; background: #e6fced; padding: 15px; border-radius: 4px;">
          <h3>Done</h3>
          @for (task of doneTasks(); track task._id) {
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h4>{{ task.title }}</h4>
              <p>Assigned to: {{ task.assignedTo }}</p>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class BoardComponent {
  private boardService = inject(BoardService);

  // Computed signals split our core dataset into view categories dynamically
  todoTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'todo'));
  progressTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'progress'));
  doneTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'done'));

  addNewTask(title: string, assignedTo: string): void {
    if (!title || !assignedTo) return;
    
    const newTask: Task = {
      title,
      assignedTo,
      description: '',
      status: 'todo',
      points: 2
    };

    this.boardService.createTask(newTask).subscribe();
  }

  moveTask(id: string, nextStatus: 'todo' | 'progress' | 'done'): void {
    this.boardService.updateTaskStatus(id, nextStatus).subscribe();
  }
}
