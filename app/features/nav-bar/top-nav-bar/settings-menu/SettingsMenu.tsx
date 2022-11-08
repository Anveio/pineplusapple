import * as React from "react";
import { AppModal, useActiveModal } from "~/features/modal-layer";
import { PRIMARY_BUTTON_TEXT_CLASSNAMES } from "~/shared";
import { ICON_SIZE } from "../../constants";

interface Props {}

export const SettingsMenu: React.FC<Props> = (props) => {
  const { toggleActiveModal } = useActiveModal();

  return (
    <div className="grid place-content-center">
      <button
        aria-label="Settings"
        onClick={() => {
          toggleActiveModal(AppModal.MAIN_SETTINGS);
        }}
      >
        <svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
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
        </svg>
      </button>
    </div>
  );
};