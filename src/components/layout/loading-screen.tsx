import { motion } from 'framer-motion';

export function LoadingScreen({ label = 'Загружаем Body Track...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border bg-card/90 p-8 text-center shadow-xl backdrop-blur"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="size-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-teal-400"
          animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.4, ease: 'easeInOut' }}
        />
        <p className="text-sm text-muted-foreground">{label}</p>
      </motion.div>
    </div>
  );
}
