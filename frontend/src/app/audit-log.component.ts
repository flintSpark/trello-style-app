import { Component, inject } from '@angular/core';
import { BoardService } from './board.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div style="margin-top: 30px; padding: 20px; background: #fafafa; border: 1px solid #e0e0e0; border-radius: 4px; font-family: sans-serif;">
      <h3>Live System Audit Trail (Multi-Channel WebSockets)</h3>
      
      <div style="max-height: 200px; overflow-y: auto; background: white; border: 1px solid #ccc; padding: 10px; border-radius: 4px;">
        @for (log of activities(); track log._id) {
          <div style="padding: 8px 0; border-bottom: 1px dashed #eee; font-size: 0.9em; display: flex; justify-content: space-between;">
            <span style="color: #333;">{{ log.details }}</span>
            <span style="color: #888; font-size: 0.85em;">{{ log.timestamp | date:'mediumTime' }}</span>
          </div>
        } @empty {
          <div style="color: #999; text-align: center; padding: 10px;">No recent system activities detected.</div>
        }
      </div>
    </div>
  `
})
export class AuditLogComponent {
  private boardService = inject(BoardService);
  activities = this.boardService.activities; // Accesses the shared data stream signal
}
