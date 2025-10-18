import dayjs from 'dayjs';
import { IExecution, IScheduledJob, ScheduledJobModel } from '../models/scheduledJobs.schema';

const MAX_EXECUTIONS_TO_KEEP = 20;

export const upsertScheduledJob = async (opts: {
  name: string;
  jobId: string;
  schedulePattern: string;
  meta?: Record<string, any>;
}) => {
  const { name, jobId, schedulePattern, meta = {} } = opts;
  const now = Date.now();
  const res = await ScheduledJobModel.findOneAndUpdate(
    { jobId },
    {
      $set: { name, schedulePattern, meta, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, new: true },
  ).lean();
  return res as IScheduledJob;
};

export const createExecutionEntry = async (jobId: string) => {
  const runAtUnix = dayjs().unix();
  const exec: IExecution = { runAtUnix, status: 'pending' };
  const doc = await ScheduledJobModel.findOneAndUpdate(
    { jobId },
    {
      $push: { executions: exec },
      $set: { status: 'pending', updatedAt: Date.now() },
    },
    { new: true },
  );
  // Optionally trim history:
  if (doc && doc.executions.length > MAX_EXECUTIONS_TO_KEEP) {
    doc.executions = doc.executions.slice(-MAX_EXECUTIONS_TO_KEEP);
    await doc.save();
  }
  return runAtUnix; // caller uses this to match entry (runAtUnix)
};

export const markExecutionStarted = async (jobId: string, runAtUnix: number) => {
  const startedAtUnix = dayjs().unix();
  await ScheduledJobModel.updateOne(
    { jobId, 'executions.runAtUnix': runAtUnix },
    {
      $set: {
        'executions.$.startedAtUnix': startedAtUnix,
        'executions.$.status': 'running',
        updatedAt: Date.now(),
        status: 'running',
      },
    },
  );
};

export const markExecutionFinished = async (
  jobId: string,
  runAtUnix: number,
  success: boolean,
  errorMessage?: string,
) => {
  const finishedAtUnix = dayjs().unix();
  const doc = await ScheduledJobModel.findOne({ jobId });
  if (!doc) return;
  const exec: any = doc.executions.find((e) => e.runAtUnix === runAtUnix);
  if (!exec) return;
  exec.finishedAtUnix = finishedAtUnix;
  exec.status = success ? 'completed' : 'failed';
  exec.durationMs = exec.startedAtUnix ? (finishedAtUnix - exec.startedAtUnix) * 1000 : undefined;
  exec.errorMessage = errorMessage ?? null;

  doc.lastRunAtUnix = finishedAtUnix;
  doc.status = success ? 'completed' : 'failed';
  doc.updatedAt = Date.now();

  // keep executions bounded
  if (doc.executions.length > MAX_EXECUTIONS_TO_KEEP) {
    doc.executions = doc.executions.slice(-MAX_EXECUTIONS_TO_KEEP);
  }
  await doc.save();
};

export const getIncompleteJobs = async () => {
  // jobs that have a latest execution not completed
  return ScheduledJobModel.find({
    'executions.0': { $exists: true }, // has runs
    $or: [{ status: 'pending' }, { status: 'running' }, { status: 'waiting' }],
  }).lean();
};

export const getScheduledJobByName = async (name: string) => {
  return ScheduledJobModel.findOne({ name }).lean();
};
