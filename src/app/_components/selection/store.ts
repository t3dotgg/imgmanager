import { create } from "zustand";

interface SelectState {
  selectedIds: string[];
  toggleIdSelection: (id: string) => void;
  clearAll: () => void;
}

export const useSelectStore = create<SelectState>()((set) => ({
  selectedIds: [],
  toggleIdSelection: (id) =>
    set((state) => {
      if (state.selectedIds.includes(id)) {
        return {
          selectedIds: state.selectedIds.filter(
            (selectedId) => selectedId !== id
          ),
        };
      }
      return {
        selectedIds: [...state.selectedIds, id],
      };
    }),
  clearAll: () => set({ selectedIds: [] }),
}));

export const useSelectedIds = () =>
  useSelectStore((state) => state.selectedIds);

export const useIdToggle = (id: string) => {
  const toggleIdSelection = useSelectStore((state) => state.toggleIdSelection);
  const isSelected = useSelectStore((state) => state.selectedIds.includes(id));

  return { toggle: () => toggleIdSelection(id), isSelected };
};
