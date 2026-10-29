import { Component, inject, computed } from '@angular/core';
import { BoardService, Task } from './board.service';
import { MetricsComponent } from './metrics.component';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AuditLogComponent } from './audit-log.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [MetricsComponent, DragDropModule, AuditLogComponent], 
  styleUrls: ['./board.component.css'],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Real-Time Collaboration Board</h2>

      <!-- Form Section to Add Tasks with Priority Dropdown -->
      <div style="margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
        <h3>Create New Task</h3>
        <input #titleInput type="text" placeholder="Task Title" style="margin-right: 10px; padding: 5px;">
        <input #assigneeInput type="text" placeholder="Assignee Name" style="margin-right: 10px; padding: 5px;">
        <!-- Priority Dropdown Selection -->
        <select #priorityInput style="margin-right: 10px; padding: 5px;">
          <option value="low">Low Priority</option>
          <option value="medium" selected>Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button (click)="addNewTask(titleInput.value, assigneeInput.value, priorityInput.value); titleInput.value=''; assigneeInput.value=''">
          Add Task
        </button>
        <button (click)="clearBoard()" style="margin-left: 10px; background: #ff4d4d; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
          Clear Board
        </button>
      </div>

      <!-- Unified Kanban Columns Container Drop Group -->
      <div cdkDropListGroup style="display: flex; gap: 20px;">
        
        <!-- Todo Column Container -->
        <div style="flex: 1; background: #eaeaea; padding: 15px; border-radius: 4px;">
          <h3>To Do</h3>
          <div cdkDropList [cdkDropListData]="todoTasks()" (cdkDropListDropped)="onDrop($event, 'todo')" style="min-height: 200px;">
            @for (task of todoTasks(); track task._id) {
            <div cdkDrag class="example-box" style="position: relative; background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;"> 
                <h4 style="margin: 0 0 5px 0;">{{ task.title }}</h4> 
                <!-- Priority Badge Component --> 
                <span [style]="getPriorityStyle(task.priority)" style="font-size: 10px; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; font-weight: bold;"> 
                  {{ task.priority || 'medium' }} 
                </span> 
              </div>
              <p style="margin: 0; font-size: 13px; color: #555;">Assigned to: {{ task.assignedTo }}</p> 
            </div>
            }
          </div>
        </div>

        <!-- Progress Column Container -->
        <div style="flex: 1; background: #e2f0fe; padding: 15px; border-radius: 4px;">
          <h3>In Progress</h3>
          <div cdkDropList [cdkDropListData]="progressTasks()" (cdkDropListDropped)="onDrop($event, 'progress')" style="min-height: 200px;">
            @for (task of progressTasks(); track task._id) {
              <div cdkDrag class="example-box" style="position: relative; background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 5px 0;">{{ task.title }}</h4>
                  <span [style]="getPriorityStyle(task.priority)" style="font-size: 10px; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; font-weight: bold;">
                    {{ task.priority || 'medium' }}
                  </span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #555;">Assigned to: {{ task.assignedTo }}</p>
              </div>            
            }
          </div>
        </div>

        <!-- Done Column Container -->
        <div style="flex: 1; background: #e6fced; padding: 15px; border-radius: 4px;">
          <h3>Done</h3>
          <div cdkDropList [cdkDropListData]="doneTasks()" (cdkDropListDropped)="onDrop($event, 'done')" style="min-height: 200px;">
            @for (task of doneTasks(); track task._id) {
              <div cdkDrag class="example-box" style="position: relative; background: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 5px 0;">{{ task.title }}</h4>
                  <span [style]="getPriorityStyle(task.priority)" style="font-size: 10px; padding: 2px 6px; border-radius: 10px; text-transform: uppercase; font-weight: bold;">
                    {{ task.priority || 'medium' }}
                  </span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #555;">Assigned to: {{ task.assignedTo }}</p>
              </div>            
            }
          </div>
        </div>

      </div>
      
      <app-metrics></app-metrics>
      <app-audit-log></app-audit-log>
    </div>
  `
})
export class BoardComponent {
  private boardService = inject(BoardService);

  todoTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'todo'));
  progressTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'progress'));
  doneTasks = computed(() => this.boardService.tasks().filter(t => t.status === 'done'));

  addNewTask(title: string, assignedTo: string, priority: string): void {
    if (!title || !assignedTo) return;
    
    const newTask: Task = {
      title,
      assignedTo,
      description: '',
      status: 'todo',
      points: 2,
      priority: priority as 'low' | 'medium' | 'high'
    };

    this.boardService.createTask(newTask).subscribe();
  }

  // dynamic returner for badge styles per level
  getPriorityStyle(priority?: string): string {
    switch (priority) {
      case 'high':
        return 'background: #ffebee; color: #c62828; border: 1px solid #ef9a9a;';
      case 'low':
        return 'background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;';
      case 'medium':
      default:
        return 'background: #fff8e1; color: #f57f17; border: 1px solid #ffe082;';
    }
  }

  // Intercepts the card drop event location metrics and executes our WebSocket state update
  onDrop(event: CdkDragDrop<Task[]>, targetStatus: 'todo' | 'progress' | 'done'): void {
    // If dropped back inside the exact same column, cancel execution
    if (event.previousContainer === event.container) return;

    // Isolate the matching dragged task data criteria
    const draggedTask = event.previousContainer.data[event.previousIndex];
    
    if (draggedTask && draggedTask._id) {
      const moverName = draggedTask.assignedTo || 'a team member';

      this.boardService.updateTaskStatus(draggedTask._id, targetStatus, moverName).subscribe();
    }
  }

  clearBoard(): void {
    if (confirm('Are you sure you want to permanently delete all tasks and logs?')) {
      this.boardService.purgeEntireBoard().subscribe();
    }
}

}
