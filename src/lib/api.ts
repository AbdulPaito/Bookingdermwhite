import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface Promo {
  _id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  badge?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  _id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  price?: number;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  hero_image: string;
  hero_badge: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtext: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
}

export interface ScheduleSettings {
  active_days: string[];
  start_time: string;
  end_time: string;
  interval: number;
}

export interface Slot {
  time: string;
  count: number;
}

// ───────────────────────────── Auth ─────────────────────────────
export const login = async (email: string, password: string) => {
  const res = await apiClient.post("/auth/login", { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

// ───────────────────────────── Promos ─────────────────────────────
export const getPromos = async (): Promise<Promo[]> => {
  const res = await apiClient.get("/promos");
  return res.data.data;
};

export const getPromo = async (id: string): Promise<Promo> => {
  const res = await apiClient.get(`/promos/${id}`);
  return res.data.data;
};

export const createPromo = async (data: Omit<Promo, "_id">): Promise<Promo> => {
  const res = await apiClient.post("/promos", data);
  return res.data.data;
};

export const updatePromo = async (id: string, data: Partial<Promo>): Promise<Promo> => {
  const res = await apiClient.put(`/promos/${id}`, data);
  return res.data.data;
};

export const deletePromo = async (id: string): Promise<void> => {
  await apiClient.delete(`/promos/${id}`);
};

// ───────────────────────────── Bookings ─────────────────────────────
export const createBooking = async (data: {
  name: string;
  phone: string;
  service?: string;
  date: string;
  time: string;
  price?: number;
}): Promise<Booking> => {
  const res = await apiClient.post("/bookings", data);
  return res.data.data;
};

export const getBookings = async (params?: { status?: string; date?: string }): Promise<Booking[]> => {
  const res = await apiClient.get("/bookings", { params });
  return res.data.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const res = await apiClient.get(`/bookings/${id}`);
  return res.data.data;
};

export const confirmBooking = async (id: string): Promise<Booking> => {
  const res = await apiClient.patch(`/bookings/${id}/confirm`);
  return res.data.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const res = await apiClient.patch(`/bookings/${id}/cancel`);
  return res.data.data;
};

export const deleteBooking = async (id: string): Promise<void> => {
  await apiClient.delete(`/bookings/${id}`);
};

export const getTodaysAppointments = async (): Promise<Booking[]> => {
  const res = await apiClient.get("/bookings/today");
  return res.data.data;
};

export const getRecentBookings = async (limit = 5): Promise<Booking[]> => {
  const res = await apiClient.get("/bookings/recent", { params: { limit } });
  return res.data.data;
};

export const getAvailability = async (date: string): Promise<{
  date: string;
  day: string;
  isOpen: boolean;
  slots: Slot[];
  message?: string;
}> => {
  const res = await apiClient.get("/schedule/slots", { params: { date } });
  return res.data;
};

// ───────────────────────────── Schedule ─────────────────────────────
export const getSchedule = async (): Promise<ScheduleSettings> => {
  const res = await apiClient.get("/schedule");
  return res.data.data;
};

export const updateSchedule = async (data: Partial<ScheduleSettings>): Promise<ScheduleSettings> => {
  const res = await apiClient.put("/schedule", data);
  return res.data.data;
};

// ───────────────────────────── Site Settings ─────────────────────────────
export const getSettings = async (): Promise<SiteSettings> => {
  const res = await apiClient.get("/settings");
  return res.data.data;
};

export const updateSettings = async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
  const res = await apiClient.put("/settings", data);
  return res.data.data;
};

// ───────────────────────────── Analytics ─────────────────────────────
export const getBookingStats = async (): Promise<{
  total: number; pending: number; confirmed: number; cancelled: number;
}> => {
  const res = await apiClient.get("/analytics/bookings");
  return res.data.data;
};

export const getWeeklyData = async (): Promise<
  { day: string; date: string; bookings: number }[]
> => {
  const res = await apiClient.get("/analytics/weekly");
  return res.data.data;
};

export const getDashboardSummary = async () => {
  const res = await apiClient.get("/analytics/dashboard");
  return res.data.data;
};

// ───────────────────────────── Upload ─────────────────────────────
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};