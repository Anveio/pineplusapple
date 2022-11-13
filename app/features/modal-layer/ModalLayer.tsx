import { Form } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { PRIMARY_BUTTON_CLASSNAMES, useOptionalUser } from "~/shared";
import { useOnClickOutside } from "~/shared/utils/use-on-outside-click";
import { ColorSchemeButton, useColorScheme } from "../color-scheme";
import { AppModal, useActiveModal } from "./active-modal-store";

interface ModalChildProps {
  onClose: () => void;
}

export const ModalLayer: React.FC = () => {
  const { activeModal, setActiveModal } = useActiveModal();

  const modalLayerRef = React.useRef<HTMLDialogElement | null>(null);

  const MODAL_ID_TO_MODAL_COMPONENT_MAP: Readonly<
    Record<AppModal, React.FC<ModalChildProps>>
  > = {
    [AppModal.MAIN_SETTINGS]: MainSettingsMenu,
  };

  const ComponentToRender = activeModal
    ? MODAL_ID_TO_MODAL_COMPONENT_MAP[activeModal]
    : null;

  React.useEffect(() => {
    if (activeModal) {
      modalLayerRef.current?.showModal();
    } else {
      modalLayerRef.current?.close();
    }
  }, [activeModal]);

  const handleCloseClick = () => {
    setActiveModal(null);
  };

  return (
    <AnimatePresence>
      {ComponentToRender !== null ? (
        <motion.dialog
          id="modal-layer"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -25 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.3 }}
          className={`mt-[64px] block flex min-h-screen w-screen max-w-screen-xl items-stretch rounded-lg bg-terracotta-blond transition-colors duration-300 dark:bg-terracotta-konbu`}
          ref={modalLayerRef}
          onClose={handleCloseClick}
        >
          <ComponentToRender onClose={handleCloseClick} />
        </motion.dialog>
      ) : null}
    </AnimatePresence>
  );
};

const MainSettingsMenu: React.FC<ModalChildProps> = (props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const user = useOptionalUser();
  useOnClickOutside(ref, () => {
    console.log("clicked outside modal");
    props.onClose();
  });
  return (
    <div ref={ref} className="w-full">
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
            <div className="grid grid-cols-2 gap-3">
              <ColorSchemeButton />
              <button onClick={props.onClose}>Close</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};
