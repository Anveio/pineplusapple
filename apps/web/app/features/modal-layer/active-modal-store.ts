import React from "react";
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
      console.log("from store", activeModal);

      return {
        activeModal: activeModal === nextActiveModal ? null : nextActiveModal,
      };
    });
  },
}));

export const useActiveModal = () => {
  const isSubscribed = React.useRef(false);

  const hookResult = useStore(activeModalStore);

  React.useEffect(() => {
    if (isSubscribed.current) {
      return;
    }

    isSubscribed.current = true;

    if (hookResult.activeModal !== null) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      isSubscribed.current = false;
      document.body.classList.remove("overflow-hidden");
    };
  }, [hookResult.activeModal]);

  React.useEffect(() => {});

  return hookResult;
};
