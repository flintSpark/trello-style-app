import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BoardService, Task } from './board.service';
import * as socketIoClient from 'socket.io-client';

const mockSocketHandlers: { [key: string]: Function } = {};

vi.mock('socket.io-client', () => {
  return {
    io: () => ({
      on: (event: string, callback: Function) => {
        mockSocketHandlers[event] = callback;
      }
    })
  };
});

describe('BoardService Real-Time Sync Suite', () => {
  let service: BoardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BoardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(BoardService);
    httpTestingController = TestBed.inject(HttpTestingController);

    const req = httpTestingController.expectOne('http://localhost:3000/api/tasks');
    req.flush([]);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should reactively push a new task into the signal array when receiving a WebSocket event', () => {
    const incomingWebSocketTask: Task = {
      _id: 'task_999',
      title: 'Real-Time Sync Test',
      description: '',
      status: 'todo',
      assignedTo: 'Automated Runner',
      points: 2
    };

    expect(service.tasks().length).toBe(0);

    if (mockSocketHandlers['taskCreated']) {
      mockSocketHandlers['taskCreated'](incomingWebSocketTask);
    }

    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].title).toBe('Real-Time Sync Test');
    expect(service.tasks()[0]._id).toBe('task_999');
  });
});
