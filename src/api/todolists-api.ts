import axios from "axios";
import { UpdateDomainTaskModelType } from "features/TodolistsList/tasks-reducer";

const settings = {
  withCredentials: true,
  headers: {
    "API-KEY": "1cdd9f77-c60e-4af5-b194-659e4ebd5d41",
  },
};
const instance = axios.create({
  baseURL: "https://social-network.samuraijs.com/api/1.1/",
  ...settings,
});

// api
export const todolistsAPI = {
  getTodolists() {
    return instance.get<TodoListType[]>("todo-lists");
  },
  createTodolist(title: string) {
    return instance.post<ResponseType<{ item: TodoListType }>>("todo-lists", { title: title });
  },
  deleteTodolist(id: string) {
    return instance.delete<ResponseType>(`todo-lists/${id}`);
  },
  updateTodolist(id: string, title: string) {
    return instance.put<ResponseType>(`todo-lists/${id}`, { title: title });
  },
  getTasks(todoListId: string) {
    return instance.get<GetTasksResponse>(`todo-lists/${todoListId}/tasks`);
  },
  deleteTask(arg: deleteTaskArgType) {
    return instance.delete<ResponseType>(`todo-lists/${arg.todoListId}/tasks/${arg.taskId}`);
  },
  createTask(arg: AddTaskArgType) {
    return instance.post<ResponseType<{ item: TaskType }>>(`todo-lists/${arg.todoListId}/tasks`, { title: arg.title });
  },
  updateTask(todolistId: string, taskId: string, domainModel: UpdateTaskModelType) {
    return instance.put<ResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, domainModel);
  },
};

export type LoginParamsType = {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
};

export const authAPI = {
  login(data: LoginParamsType) {
    const promise = instance.post<ResponseType<{ userId?: number }>>("auth/login", data);
    return promise;
  },
  logout() {
    const promise = instance.delete<ResponseType<{ userId?: number }>>("auth/login");
    return promise;
  },
  me() {
    const promise = instance.get<ResponseType<{ id: number; email: string; login: string }>>("auth/me");
    return promise;
  },
};

// types
export type TodoListType = {
  id: string;
  title: string;
  addedDate: string;
  order: number;
};
export type ResponseType<D = {}> = {
  resultCode: number;
  messages: Array<string>;
  data: D;
};

export enum TaskStatuses {
  New = 0,
  InProgress = 1,
  Completed = 2,
  Draft = 3,
}

export enum TaskPriorities {
  Low = 0,
  Middle = 1,
  Hi = 2,
  Urgently = 3,
  Later = 4,
}

export type TaskType = {
  description: string;
  title: string;
  status: TaskStatuses;
  priority: TaskPriorities;
  startDate: string;
  deadline: string;
  id: string;
  todoListId: string;
  order: number;
  addedDate: string;
};
export type UpdateTaskModelType = {
  title: string;
  description: string;
  status: TaskStatuses;
  priority: TaskPriorities;
  startDate: string;
  deadline: string;
};
type GetTasksResponse = {
  error: string | null;
  totalCount: number;
  items: TaskType[];
};
export type AddTaskArgType = {
  title: string;
  todoListId: string;
};
export type UpdateTaskArgType = {
  taskId: string;
  domainModel: UpdateDomainTaskModelType;
  todolistId: string;
};
export type deleteTaskArgType = {
  todoListId: string;
  taskId: string;
};
