import {
  AddTaskArgType,
  deleteTaskArgType,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskArgType,
  UpdateTaskModelType,
} from "api/todolists-api";
import { appActions } from "app/app-reducer";
import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { todolistsActions } from "features/TodolistsList/todolists-reducer";
import { clearStoreData } from "common/actions";
import { createAppAsyncThunk } from "utils/create-app-async-thunk";
import { handleServerAppError } from "utils/handle-server-app-error";
import { handleServerNetworkError } from "utils/handle-server-network-error";

const initialState: TasksStateType = {};

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todolistId: string }, string>(
  "tasks/fetchTasks",
  async (todolistId: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await todolistsAPI.getTasks(todolistId);
      const tasks = res.data.items;
      dispatch(appActions.setAppStatus({ status: "succeeded" }));
      return { tasks, todolistId };
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);
export const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>(
  "tasks/addTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));

      const res = await todolistsAPI.createTask(arg);
      if (res.data.resultCode === 0) {
        const task = res.data.data.item;

        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { task };
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);
export const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>(
  "tasks/updateTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));

      const state = getState();
      const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
      if (!task) {
        dispatch(appActions.setAppError({ error: "task not found in the state" }));
        return rejectWithValue(null);
      }
      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...arg.domainModel,
      };
      const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel);
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));

        return arg;
      } else {
        handleServerAppError(res.data, dispatch);
        return rejectWithValue(null);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);
export const removeTask = createAppAsyncThunk<deleteTaskArgType, deleteTaskArgType>(
  "tasks/removeTask",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;

    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));

      const res = await todolistsAPI.deleteTask(arg);
      dispatch(appActions.setAppStatus({ status: "succeeded" }));

      return arg;
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  }
);
const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string; todolistId: string }>) => {},
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state[action.payload.todolistId] = action.payload.tasks;
    });
    builder.addCase(addTask.fulfilled, (state, action) => {
      state[action.payload.task.todoListId].unshift(action.payload.task);
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      let index = state[action.payload.todolistId].findIndex((task) => task.id == action.payload.taskId);
      if (index !== -1)
        state[action.payload.todolistId][index] = {
          ...state[action.payload.todolistId][index],
          ...action.payload.domainModel,
        };
    });
    builder.addCase(removeTask.fulfilled, (state, action) => {
      let index = state[action.payload.todoListId].findIndex((task) => task.id == action.payload.taskId);
      if (index !== -1) state[action.payload.todoListId].splice(index, 1);
    });
    builder.addCase(todolistsActions.addTodolist, (state, action) => {
      state[action.payload.todolist.id] = [];
    });
    builder.addCase(todolistsActions.removeTodolist, (state, action) => {
      delete state[action.payload.id];
    });
    builder.addCase(todolistsActions.setTodolists, (state, action) => {
      action.payload.todolists.forEach((tl) => {
        state[tl.id] = [];
      });
    });
    builder.addCase(clearStoreData, (state, action) => {
      console.log(current(state));
      return {};
    });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
