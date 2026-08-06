import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/schemas";

/**
 * Status pill. Colours follow the badge.variants block in
 * docs/dashboard-design.json. Text always states the status; colour only
 * reinforces it, so meaning survives greyscale and colour blindness.
 */
const styles: Record<LeadStatus, string> = {
  sent: "bg-[#E7F4EC] text-[#43815F] border-[#C9E5D4]",
  unsent: "bg-[#FFF7E0] text-[#C59626] border-[#F4E2AA]",
  duplicate: "bg-[#F0F3F1] text-[#6F7974] border-[#E1E6E3]",
  failed: "bg-[#FDECEC] text-[#C96C6C] border-[#F2D0D0]",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={`capitalize ${styles[status]}`}>
      {status}
    </Badge>
  );
}
