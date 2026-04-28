import { useEffect, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Ban, ShieldOff } from "lucide-react";
import { blockUser, isUserBlocked, unblockUser } from "@/lib/moderation";
import { toast } from "@/hooks/use-toast";

interface Props {
  otherUserId: string;
  otherUserName?: string;
  size?: "sm" | "default";
}

export const BlockUserButton = ({ otherUserId, otherUserName, size = "sm" }: Props) => {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isUserBlocked(otherUserId).then(setBlocked).catch(() => {});
  }, [otherUserId]);

  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockUser(otherUserId);
      setBlocked(true);
      toast({ title: "User blocked", description: "They can no longer initiate swaps with you." });
    } catch (e: any) {
      toast({ title: "Couldn't block", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockUser(otherUserId);
      setBlocked(false);
      toast({ title: "User unblocked" });
    } catch (e: any) {
      toast({ title: "Couldn't unblock", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (blocked) {
    return (
      <Button variant="ghost" size={size} onClick={handleUnblock} disabled={loading}>
        <ShieldOff className="w-4 h-4" /> Unblock
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={size}>
          <Ban className="w-4 h-4" /> Block
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {otherUserName ?? "this user"}?</AlertDialogTitle>
          <AlertDialogDescription>
            They won't be able to start new swaps with you. You can unblock them anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={loading}>Block user</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
