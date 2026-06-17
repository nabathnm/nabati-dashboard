"use client";

import { useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useAppDispatch } from "@/redux/hooks";
import { setTasks, setLoading, setError } from "@/redux/features/tasksSlice";

export function TaskReduxSync() {
  const { data: tasks, isLoading, error } = useTasks({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading(isLoading));
    
    if (tasks) {
      dispatch(setTasks(tasks));
    }
    
    if (error) {
      dispatch(setError(error.message));
    }
  }, [tasks, isLoading, error, dispatch]);

  return null;
}
