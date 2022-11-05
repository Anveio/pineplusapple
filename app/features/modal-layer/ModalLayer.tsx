import { AnimatePresence } from "framer-motion";
import * as React from "react";
import { AppModal, useActiveModal } from "./active-modal-store";

interface Props {}

export const ModalLayer: React.FC<Props> = (props) => {
  const { activeModal, setActiveModal } = useActiveModal();

  const MODAL_ID_TO_MODAL_COMPONENT_MAP: Readonly<
    Record<AppModal, JSX.Element>
  > = {
    [AppModal.MAIN_SETTINGS]: (
      <dialog
        onClose={() => setActiveModal(null)}
        className="bg-red absolute top-0 z-50 h-screen w-screen"
      >
        <div>CREATE_NEW_NOTE</div>
      </dialog>
    ),
  };

  return (
    <AnimatePresence>
      {activeModal !== null
        ? MODAL_ID_TO_MODAL_COMPONENT_MAP[activeModal]
        : null}
    </AnimatePresence>
  );
};
