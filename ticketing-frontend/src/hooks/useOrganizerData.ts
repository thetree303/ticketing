import { useState, useEffect } from "react";
import { eventService, categoryService } from "../services/api";
import type { Event } from "../types";

interface Category {
  id: number;
  name: string;
}

export const useOrganizerData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const catRes = await categoryService.getAll();
      setCategories(catRes.data);
    } catch (error) {
      console.error("Lỗi tải danh mục", error);
    }
  };

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data);
    } catch (error) {
      console.error("Fetch events error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    events,
    categories,
    loading,
    fetchMyEvents,
    fetchCategories,
  };
};
