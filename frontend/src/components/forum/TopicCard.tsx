import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { PublicTopic } from "@/components/forum/forum-types";
import { formatForumDate } from "@/components/forum/forum-types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface TopicCardProps {
  topic: PublicTopic;
  className?: string;
}

export function TopicCard({ topic, className }: TopicCardProps) {
  return (
    <Link href={`/forum/${topic.id}`} className={cn("group block h-full", className)}>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge type="forum">Público</Badge>
            {topic.theme ? (
              <Badge type="default">{topic.theme}</Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-content-primary transition-colors group-hover:text-bordeaux dark:text-content-dark-primary dark:group-hover:text-bordeaux-dark">
              {topic.title}
            </h2>
            {topic.description ? (
              <p className="line-clamp-3 text-sm text-content-secondary dark:text-content-dark-secondary">
                {topic.description}
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-content-tertiary dark:border-border-dark dark:text-content-dark-tertiary">
            <span>{topic.author?.name ?? "Comunidade Jindungo"}</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                {topic.replies_count ?? 0}
              </span>
              <time dateTime={topic.updated_at}>
                {formatForumDate(topic.updated_at)}
              </time>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
