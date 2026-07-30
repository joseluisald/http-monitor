import { create } from 'zustand';
import { HttpLog, LogFilterParams, SavedFilter } from '../types';
import { api } from '../services/api';

interface LogState {
  logs: HttpLog[];
  totalLogs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  isLoading: boolean;
  error: string | null;

  // Realtime & Live Mode
  liveMode: boolean;
  toggleLiveMode: () => void;
  setLiveMode: (live: boolean) => void;

  // Filters
  filters: LogFilterParams;
  setFilters: (filters: Partial<LogFilterParams>) => void;
  resetFilters: () => void;

  // Selected Log for Details Drawer
  selectedLog: HttpLog | null;
  setSelectedLog: (log: HttpLog | null) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  // Actions
  fetchLogs: () => Promise<void>;
  addIncomingLog: (log: HttpLog) => void;

  // Saved Filters
  savedFilters: SavedFilter[];
  saveCurrentFilter: (name: string) => void;
  loadSavedFilter: (saved: SavedFilter) => void;
  removeSavedFilter: (id: string) => void;
}

const defaultFilters: LogFilterParams = {
  application_id: '',
  method: '',
  status: '',
  status_group: undefined,
  origin: '',
  start_date: '',
  end_date: '',
  query_text: '',
  user: '',
  min_duration: undefined,
  max_duration: undefined,
  tag: '',
  page: 1,
  limit: 25,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  totalLogs: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 25,
  isLoading: false,
  error: null,

  liveMode: true,
  toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),
  setLiveMode: (live) => set({ liveMode: live }),

  filters: defaultFilters,
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }));
    get().fetchLogs();
  },
  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchLogs();
  },

  selectedLog: null,
  setSelectedLog: (log) => set({ selectedLog: log, isDrawerOpen: !!log }),
  isDrawerOpen: false,
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getLogs(get().filters);
      set({
        logs: response.data,
        totalLogs: response.meta.total,
        totalPages: response.meta.total_pages,
        currentPage: response.meta.page,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load HTTP logs' });
    }
  },

  addIncomingLog: (newLog: HttpLog) => {
    const { liveMode, logs, totalLogs, filters } = get();
    if (!liveMode) return;

    // Check if newLog matches current filters
    if (filters.application_id && filters.application_id !== newLog.application_id) return;
    if (filters.method && !filters.method.split(',').includes(newLog.method)) return;
    if (filters.origin && !filters.origin.split(',').includes(newLog.origin)) return;

    // Prepend new log
    set({
      logs: [newLog, ...logs.slice(0, filters.limit || 25)],
      totalLogs: totalLogs + 1,
    });
  },

  // Saved Filters
  savedFilters: [
    { id: '1', name: 'Erros 5xx', params: { status_group: '5xx' }, created_at: new Date().toISOString() },
    { id: '2', name: 'Requisições Lentas (>1s)', params: { min_duration: 1000 }, created_at: new Date().toISOString() },
    { id: '3', name: 'Tráfego Queue/Cron', params: { origin: 'QUEUE,CRON' }, created_at: new Date().toISOString() },
  ],
  saveCurrentFilter: (name: string) => {
    const newSaved: SavedFilter = {
      id: String(Date.now()),
      name,
      params: { ...get().filters },
      created_at: new Date().toISOString(),
    };
    set((state) => ({ savedFilters: [...state.savedFilters, newSaved] }));
  },
  loadSavedFilter: (saved) => {
    set({ filters: { ...defaultFilters, ...saved.params, page: 1 } });
    get().fetchLogs();
  },
  removeSavedFilter: (id) => {
    set((state) => ({ savedFilters: state.savedFilters.filter((f) => f.id !== id) }));
  },
}));
