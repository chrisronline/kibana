/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { filter } from 'rxjs/operators';

import { pipe } from 'fp-ts/lib/pipeable';
import { Option, map as mapOptional, getOrElse, isSome } from 'fp-ts/lib/Option';

import uuid from 'uuid';
import { pick } from 'lodash';
import { merge } from 'rxjs';
import { Logger } from '../../../../src/core/server';
import { asOk, either, map, mapErr, promiseResult } from './lib/result_type';
import {
  isTaskRunEvent,
  isTaskClaimEvent,
  isTaskRunRequestEvent,
  RanTask,
  ErroredTask,
  OkResultOf,
  ErrResultOf,
  ClaimTaskErr,
  TaskClaimErrorType,
} from './task_events';
import { Middleware } from './lib/middleware';
import {
  ConcreteTaskInstance,
  TaskInstanceWithId,
  TaskInstanceWithDeprecatedFields,
  TaskLifecycle,
  TaskLifecycleResult,
  TaskStatus,
  EphemeralTask,
} from './task';
import { TaskStore } from './task_store';
import { ensureDeprecatedFieldsAreCorrected } from './lib/correct_deprecated_fields';
import { TaskLifecycleEvent, TaskPollingLifecycle } from './polling_lifecycle';
import { TaskTypeDictionary } from './task_type_dictionary';
import { EphemeralTaskLifecycle } from './ephemeral_task_lifecycle';

const VERSION_CONFLICT_STATUS = 409;

export interface TaskSchedulingOpts {
  logger: Logger;
  taskStore: TaskStore;
  taskPollingLifecycle: TaskPollingLifecycle;
  ephemeralTaskLifecycle: EphemeralTaskLifecycle;
  middleware: Middleware;
  definitions: TaskTypeDictionary;
  taskManagerId: string;
}

interface RunNowResult {
  id: ConcreteTaskInstance['id'];
  state?: ConcreteTaskInstance['state'];
}

export class TaskScheduling {
  private store: TaskStore;
  private taskPollingLifecycle: TaskPollingLifecycle;
  private ephemeralTaskLifecycle: EphemeralTaskLifecycle;
  private logger: Logger;
  private middleware: Middleware;
  private definitions: TaskTypeDictionary;
  private taskManagerId: string;

  /**
   * Initializes the task manager, preventing any further addition of middleware,
   * enabling the task manipulation methods, and beginning the background polling
   * mechanism.
   */
  constructor(opts: TaskSchedulingOpts) {
    this.logger = opts.logger;
    this.middleware = opts.middleware;
    this.taskPollingLifecycle = opts.taskPollingLifecycle;
    this.ephemeralTaskLifecycle = opts.ephemeralTaskLifecycle;
    this.store = opts.taskStore;
    this.definitions = opts.definitions;
    this.taskManagerId = opts.taskManagerId;
  }

  /**
   * Schedules a task.
   *
   * @param task - The task being scheduled.
   * @returns {Promise<ConcreteTaskInstance>}
   */
  public async schedule(
    taskInstance: TaskInstanceWithDeprecatedFields,
    options?: Record<string, unknown>
  ): Promise<ConcreteTaskInstance> {
    const { taskInstance: modifiedTask } = await this.middleware.beforeSave({
      ...options,
      taskInstance: ensureDeprecatedFieldsAreCorrected(taskInstance, this.logger),
    });
    return await this.store.schedule(modifiedTask);
  }

  /**
   * Run  task.
   *
   * @param taskId - The task being scheduled.
   * @returns {Promise<ConcreteTaskInstance>}
   */
  public async runNow(taskId: string): Promise<RunNowResult> {
    return new Promise(async (resolve, reject) => {
      this.awaitTaskRunResult(taskId)
        // don't expose state on runNow
        .then(({ id }) => resolve({ id }))
        .catch(reject);
      this.taskPollingLifecycle.attemptToRun(taskId);
    });
  }

  /**
   * Run an ad-hoc task in memory without persisting it into ES or distributing the load across the cluster.
   *
   * @param task - The ephemeral task being queued.
   * @returns {Promise<ConcreteTaskInstance>}
   */
  public async ephemeralRunNow(
    tasks: EphemeralTask[],
    options?: Record<string, unknown>
  ): Promise<RunNowResult[]> {
    return new Promise(async () =>
      Promise.allSettled(
        tasks.map(
          async (task): Promise<RunNowResult> => {
            const id = uuid.v4();
            const { taskInstance: modifiedTask } = await this.middleware.beforeSave({
              ...options,
              taskInstance: task,
            });
            return new Promise(async (resolve, reject) => {
              this.awaitTaskRunResult(id).then(resolve).catch(reject);
              this.ephemeralTaskLifecycle.attemptToRun({
                id,
                scheduledAt: new Date(),
                runAt: new Date(),
                status: TaskStatus.Idle,
                ownerId: this.taskManagerId,
                ...modifiedTask,
              });
            });
          }
        )
      )
    );
  }

  /**
   * Schedules a task with an Id
   *
   * @param task - The task being scheduled.
   * @returns {Promise<TaskInstanceWithId>}
   */
  public async ensureScheduled(
    taskInstance: TaskInstanceWithId,
    options?: Record<string, unknown>
  ): Promise<TaskInstanceWithId> {
    try {
      return await this.schedule(taskInstance, options);
    } catch (err) {
      if (err.statusCode === VERSION_CONFLICT_STATUS) {
        return taskInstance;
      }
      throw err;
    }
  }

  private async awaitTaskRunResult(taskId: string): Promise<RunNowResult> {
    return new Promise((resolve, reject) => {
      const subscription = merge(
        this.taskPollingLifecycle.events,
        this.ephemeralTaskLifecycle.events
      )
        // listen for all events related to the current task
        .pipe(filter(({ id }: TaskLifecycleEvent) => id === taskId))
        .subscribe((taskEvent: TaskLifecycleEvent) => {
          if (isTaskClaimEvent(taskEvent)) {
            mapErr(async (error: ClaimTaskErr) => {
              // reject if any error event takes place for the requested task
              subscription.unsubscribe();
              if (
                isSome(error.task) &&
                error.errorType === TaskClaimErrorType.CLAIMED_BY_ID_OUT_OF_CAPACITY
              ) {
                const task = error.task.value;
                const definition = this.definitions.get(task.taskType);
                return reject(
                  new Error(
                    `Failed to run task "${taskId}" as we would exceed the max concurrency of "${
                      definition?.title ?? task.taskType
                    }" which is ${
                      definition?.maxConcurrency
                    }. Rescheduled the task to ensure it is picked up as soon as possible.`
                  )
                );
              } else {
                return reject(await this.identifyTaskFailureReason(taskId, error.task));
              }
            }, taskEvent.event);
          } else {
            either<OkResultOf<TaskLifecycleEvent>, ErrResultOf<TaskLifecycleEvent>>(
              taskEvent.event,
              (taskInstance: OkResultOf<TaskLifecycleEvent>) => {
                // resolve if the task has run sucessfully
                if (isTaskRunEvent(taskEvent)) {
                  subscription.unsubscribe();
                  resolve(pick((taskInstance as RanTask).task, ['id', 'state']));
                }
              },
              async (errorResult: ErrResultOf<TaskLifecycleEvent>) => {
                // reject if any error event takes place for the requested task
                subscription.unsubscribe();
                return reject(
                  new Error(
                    `Failed to run task "${taskId}": ${
                      isTaskRunRequestEvent(taskEvent)
                        ? `Task Manager is at capacity, please try again later`
                        : isTaskRunEvent(taskEvent)
                        ? `${(errorResult as ErroredTask).error}`
                        : `${errorResult}`
                    }`
                  )
                );
              }
            );
          }
        });
    });
  }

  private async identifyTaskFailureReason(taskId: string, error: Option<ConcreteTaskInstance>) {
    return map(
      await pipe(
        error,
        mapOptional(async (taskReturnedBySweep) => asOk(taskReturnedBySweep.status)),
        getOrElse(() =>
          // if the error happened in the Claim phase - we try to provide better insight
          // into why we failed to claim by getting the task's current lifecycle status
          promiseResult<TaskLifecycle, Error>(this.store.getLifecycle(taskId))
        )
      ),
      (taskLifecycleStatus: TaskLifecycle) => {
        if (taskLifecycleStatus === TaskLifecycleResult.NotFound) {
          return new Error(`Failed to run task "${taskId}" as it does not exist`);
        } else if (
          taskLifecycleStatus === TaskStatus.Running ||
          taskLifecycleStatus === TaskStatus.Claiming
        ) {
          return new Error(`Failed to run task "${taskId}" as it is currently running`);
        }
        return new Error(
          `Failed to run task "${taskId}" for unknown reason (Current Task Lifecycle is "${taskLifecycleStatus}")`
        );
      },
      (getLifecycleError: Error) =>
        new Error(
          `Failed to run task "${taskId}" and failed to get current Status:${getLifecycleError}`
        )
    );
  }
}
