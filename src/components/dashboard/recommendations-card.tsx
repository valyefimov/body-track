import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle2, Lightbulb } from 'lucide-react';

interface RecommendationsCardProps {
  items: string[];
}

export function RecommendationsCard({ items }: RecommendationsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.18 }}
    >
      <Card className="border bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="size-4 text-primary" />
            Рекомендации на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
