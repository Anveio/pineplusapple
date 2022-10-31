import { AnimatePresence, motion } from "framer-motion";

export default function Store() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="m-auto"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        layout
        layoutId="top-level-navigation-main-content-change"
      >
        <h2 className="text-center text-4xl">Store</h2>
      </motion.div>
    </AnimatePresence>
  );
}
