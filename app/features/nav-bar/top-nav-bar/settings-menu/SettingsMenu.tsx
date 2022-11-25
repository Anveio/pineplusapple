import * as React from "react";
import { AppModal, useActiveModal } from "~/features/modal-layer";
import { PRIMARY_BUTTON_TEXT_CLASSNAMES } from "~/shared";
import { ICON_SIZE } from "../../constants";
import type { Variant } from "framer-motion";
import { motion } from "framer-motion";

interface Props {}

enum VariantId {
  MODAL_OPEN = "modal-open",
  MODAL_CLOSED = "modal-closed",
}

const variants: Readonly<Record<string, Variant>> = {
  initial: { rotate: 0, scale: 1, transition: { duration: 0.3 } },
  [VariantId.MODAL_OPEN]: {
    rotate: -25,
    y: 2,
    x: -2,
    scale: 1.1,
    transition: { duration: 0.3 },
  },
  [VariantId.MODAL_CLOSED]: {
    rotate: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.3 },
  },
} as const;

export const SettingsMenu: React.FC<Props> = (props) => {
  const { toggleActiveModal, activeModal } = useActiveModal();

  const modalIsOpen = activeModal
    ? VariantId.MODAL_OPEN
    : VariantId.MODAL_CLOSED;

  return (
    <div className="grid place-content-center">
      <button
        aria-label="Settings"
        onClick={(e) => {
          toggleActiveModal(AppModal.MAIN_SETTINGS);
          e.stopPropagation();
        }}
      >
        <motion.svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          variants={variants}
          animate={modalIsOpen}
          xmlns="http://www.w3.org/2000/svg"
          className={PRIMARY_BUTTON_TEXT_CLASSNAMES}
        >
          <path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 18.831 18 20 18 20l2-2-1.484-1.75 1.098-2.652 2.386-.62V11l-2.378-.605z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </motion.svg>
      </button>
    </div>
  );
};


