"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { http, toMessage } from "@/lib/http";
import type { Broker } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Manual assignment for one unsent lead.
 *
 * A single button opening a broker menu, rather than a select plus a submit
 * button: two controls per row cost twice the width, and made the admin pick a
 * broker and then confirm, when picking the broker is already the decision.
 *
 * Only active brokers appear. Assigning to an inactive one would contradict
 * the eligibility rules the automatic path enforces.
 */
export function AssignLeadForm({
  leadId,
  leadName,
  brokers,
}: {
  leadId: number;
  leadName?: string;
  brokers: Broker[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function assign(broker: Broker) {
    setPending(true);

    try {
      await http.post(`/leads/${leadId}/assign`, { brokerId: broker.id });
      toast.success(`Assigned to ${broker.name}`, {
        description: leadName ? `${leadName} is now marked sent.` : undefined,
      });
      router.refresh();
    } catch (error) {
      // A toast rather than inline text: the cell is too narrow to read an
      // error in, and on success the row leaves a filtered view entirely.
      toast.error("Could not assign this lead", {
        description: toMessage(error),
      });
    } finally {
      setPending(false);
    }
  }

  if (brokers.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">No active brokers</span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={pending}>
        <Button variant="secondary" size="sm" className="gap-1.5">
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="size-3.5" aria-hidden="true" />
          )}
          {pending ? "Assigning…" : "Assign"}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-56 rounded-xl">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          Assign to broker
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {brokers.map((broker) => (
          <DropdownMenuItem
            key={broker.id}
            onSelect={() => void assign(broker)}
          >
            <Check className="size-3.5 opacity-0" aria-hidden="true" />
            <span className="truncate">{broker.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
