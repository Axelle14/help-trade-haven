import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { REPORT_REASONS, submitReport, type ReportReason } from "@/lib/moderation";
import { Flag } from "lucide-react";

interface Props {
  reportedUserId: string;
  reportedUserName?: string;
  swapId?: string;
  messageId?: string;
  trigger?: React.ReactNode;
}

export const ReportUserDialog = ({ reportedUserId, reportedUserName, swapId, messageId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReport({ reportedUserId, reason, details, swapId, messageId });
      toast({ title: "Report submitted", description: "Our team will review it shortly." });
      setOpen(false);
      setDetails("");
    } catch (e: any) {
      toast({ title: "Couldn't submit report", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {reportedUserName ?? "user"}</DialogTitle>
          <DialogDescription>
            Reports are confidential. We'll review and take action if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">What happened?</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)} className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="flex items-start gap-3 p-3 rounded-lg border border-foreground/10 hover:bg-secondary cursor-pointer">
                  <RadioGroupItem value={r.value} id={`reason-${r.value}`} className="mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details" className="mb-2 block">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder="Share anything that helps us investigate..."
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">{details.length}/1000</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
