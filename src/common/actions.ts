import { createAction } from "@reduxjs/toolkit";
import { TodolistDomainType } from "features/TodolistsList/todolists-reducer";
import { TasksStateType } from "features/TodolistsList/tasks-reducer";
export type ClearStoreDataType = {
  tasks: TasksStateType;
  todolists: TodolistDomainType[];
};
export const clearStoreData = createAction<ClearStoreDataType>("common/clearStoreData");
