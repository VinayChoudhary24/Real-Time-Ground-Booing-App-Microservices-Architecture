import mongoose, { Schema, Document } from 'mongoose';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'waiting';

export interface IExecution {
  runAtUnix: number; // When the run was scheduled/enqueued (unix)
  startedAtUnix?: number; // started timestamp
  finishedAtUnix?: number; // finished timestamp
  status: ExecutionStatus;
  attempts?: number;
  durationMs?: number;
  errorMessage?: string | null;
}

export interface IScheduledJob extends Document {
  name: string; // 'dailyJob', 'weeklyJob'...
  jobId: string; // jobId string that you use for Bull repeatable job
  schedulePattern: string; // cron string
  lastRunAtUnix?: number;
  status: ExecutionStatus; // overall status
  executions: IExecution[]; // recent runs (push, capped)
  meta?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

const ExecutionSchema = new Schema<IExecution>({
  runAtUnix: { type: Number, required: true },
  startedAtUnix: Number,
  finishedAtUnix: Number,
  status: { type: String, required: true },
  attempts: Number,
  durationMs: Number,
  errorMessage: String,
});

const ScheduledJobSchema = new Schema<IScheduledJob>(
  {
    name: { type: String, required: true, index: true },
    jobId: { type: String, required: true, unique: true },
    schedulePattern: { type: String, required: true },
    lastRunAtUnix: Number,
    status: { type: String, default: 'pending' },
    executions: { type: [ExecutionSchema], default: [] },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { timestamps: false },
);

export const ScheduledJobModel = mongoose.model<IScheduledJob>('ScheduledJob', ScheduledJobSchema);
