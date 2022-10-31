import { AnimatePresence, motion } from "framer-motion";

export default function Store() {
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2>Store</h2>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
