import create, { useStore } from "zustand";

export enum AppModal {
  MAIN_SETTINGS = "MAIN_SETTINGS",
}

export type ActiveModalStore = {
  activeModal: AppModal | null;
  setActiveModal: (modal: AppModal | null) => void;
  toggleActiveModal: (modal: AppModal) => void;
};

export const activeModalStore = create<ActiveModalStore>((set) => ({
  activeModal: null,
  setActiveModal: (nextActiveModal: AppModal | null) =>
    set({ activeModal: nextActiveModal }),
  toggleActiveModal: (nextActiveModal: AppModal | null) => {
    set((state) => {
      const activeModal = state.activeModal;

      return {
        activeModal: activeModal === nextActiveModal ? null : nextActiveModal,
      };
    });
  },
}));

export const useActiveModal = () => {
  return useStore(activeModalStore);
};
