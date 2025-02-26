import { BADGES } from '@/consts';
import type { BadgeId } from '@/consts';

interface BadgeProps {
  badgeId: string;
  version: string;
}

export function Badge({ badgeId, version }: BadgeProps) {
  const badge = BADGES[badgeId as BadgeId];
  
  if (!badge) return null;
  
  return (
    <img
      src={badge.imageUrl}
      alt={badge.title}
      title={badge.title}
      className="inline-block h-4 w-4 mr-1"
    />
  );
}
