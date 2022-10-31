import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_MAIN_CLASSES } from "~/shared";

export default function Checkout() {
  return (
    <main className={DEFAULT_MAIN_CLASSES}>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          className="flex min-h-screen w-screen items-center justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-center text-4xl">Checkout</h2>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
