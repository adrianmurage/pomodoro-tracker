// Timer related types
export type TimerType = 'work' | 'break' | 'longBreak';

export interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  selectedTaskId: string | null;
  timerType: TimerType;
  sessionsCompleted: number;
}

// Task related types
export interface Task {
  id: string;
  category: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  focusPercentage?: number;
  completed: boolean;
  pomodoros?: number;
  order?: number;
}

// Component Props
export interface TimerProps {
  selectedTask: Task | null;
}

export interface TimerControlsProps {
  isPaused: boolean;
  hasStarted: boolean;
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onDone: () => void;
}

export interface TimerDisplayProps {
  timeLeft: number;
}

export interface TaskInputProps {
  onAddTask: (category: string, description: string) => void;
  onEditTask?: (category: string, description: string) => void;
  initialValues?: {
    category: string;
    description: string;
  };
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onReorder: (reorderedTasks: Task[]) => void;
  onDelete: (taskId: string) => void;
  onUpdatePomodoros: (taskId: string, count: number) => void;
  onEditTask: (taskId: string, category: string, description: string) => void;
}

export interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  estimatedCompletion: number;
  onDelete: (taskId: string) => void;
  onUpdatePomodoros: (taskId: string, count: number) => void;
  onEditTask: (taskId: string, category: string, description: string) => void;
  className?: string;
}

export interface NotificationProps {
  message: string;
  duration?: number;
  type?: 'error' | 'success' | 'info';
  onClose?: () => void;
}

// Hook types
export interface UseTimerProps {
  onComplete?: (timerType: TimerType) => void;
  settings?: TimerSettings;
}

export interface UseDraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
}

export interface TaskMenuProps {
  onDelete: () => void;
  onClose: () => void;
  onAddPomodoro: () => void;
  onRemovePomodoro: () => void;
  onEdit: () => void;
  pomodoroCount: number;
}

export interface NotificationState {
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface CompletionIndicatorProps {
  tasks: Task[];
  settings?: TimerSettings;
}

export interface TaskSummaryProps {
  tasks: Task[];
  settings?: TimerSettings;
} 