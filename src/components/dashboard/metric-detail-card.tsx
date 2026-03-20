import { RangeBar } from '@/components/dashboard/range-bar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface MetricDetailCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  title: string;
  value: string;
  status: string;
  description: string;
  range: {
    min: number;
    max: number;
    value: number;
    segments: Array<{ end: number; colorClass: string; label: string }>;
    ticks?: number[];
  };
  defaultOpen?: boolean;
}

export function MetricDetailCard({
  icon: Icon,
  iconColorClass,
  title,
  value,
  status,
  description,
  range,
  defaultOpen = false,
}: MetricDetailCardProps) {
  return (
    <Card className="rounded-none border-x-0 border-y bg-card/95 shadow-none">
      <CardContent className="px-4 py-3">
        <Accordion defaultValue={defaultOpen ? ['content'] : []}>
          <AccordionItem value="content" className="border-0">
            <AccordionTrigger className="px-0 py-0 hover:no-underline">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-muted p-2">
                  <Icon className={`size-4 ${iconColorClass}`} />
                </div>
                <div>
                  <p className="text-2xl leading-tight font-semibold">
                    {title} {value}
                  </p>
                  <p className="mt-1 text-lg text-muted-foreground">{status}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              <RangeBar
                className="mt-4"
                min={range.min}
                max={range.max}
                value={range.value}
                segments={range.segments}
                ticks={range.ticks}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
