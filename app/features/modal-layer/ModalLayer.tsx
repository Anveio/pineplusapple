import { Form } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { PRIMARY_BUTTON_CLASSNAMES, useOptionalUser } from "~/shared";
import { ColorSchemeButton, useColorScheme } from "../color-scheme";
import { AppModal, useActiveModal } from "./active-modal-store";

export const ModalLayer: React.FC = () => {
  const { activeModal, setActiveModal } = useActiveModal();

  const modalLayerRef = React.useRef<HTMLDialogElement | null>(null);

  const MODAL_ID_TO_MODAL_COMPONENT_MAP: Readonly<Record<AppModal, React.FC>> =
    {
      [AppModal.MAIN_SETTINGS]: MainSettingsMenu,
    };

  const ComponentToRender = activeModal
    ? MODAL_ID_TO_MODAL_COMPONENT_MAP[activeModal]
    : null;

  return (
    <AnimatePresence>
      {ComponentToRender !== null ? (
        <motion.dialog
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -10 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`absolute top-0 z-30 block h-screen w-screen max-w-screen-xl bg-terracotta-blond transition-colors duration-300 dark:bg-terracotta-konbu`}
          ref={modalLayerRef}
          onClose={() => setActiveModal(null)}
        >
          <ComponentToRender />
        </motion.dialog>
      ) : null}
    </AnimatePresence>
  );
};

const MainSettingsMenu: React.FunctionComponent = () => {
  const user = useOptionalUser();
  return (
    <div className="">
      <ul className="w-full list-none">
        <li className="grid">
          <div className="align-center flex justify-between">
            <h3 className="m-auto text-left text-2xl">Pine + Apple</h3>
            {user ? (
              <Form action="/logout" method="post">
                <button type="submit" className={PRIMARY_BUTTON_CLASSNAMES}>
                  Logout
                </button>
              </Form>
            ) : (
              <div />
            )}

            <ColorSchemeButton />
          </div>
        </li>
      </ul>
    </div>
  );
};
