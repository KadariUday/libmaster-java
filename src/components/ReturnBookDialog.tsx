import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays, format } from "date-fns";

interface ReturnBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: any;
  onSuccess: () => void;
}

export const ReturnBookDialog = ({ open, onOpenChange, book, onSuccess }: ReturnBookDialogProps) => {
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageFine, setDamageFine] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = async () => {
    setIsLoading(true);

    try {
      // Get the issued book record
      const { data: issuedBook, error: fetchError } = await supabase
        .from("issued_books")
        .select("*")
        .eq("book_id", book.id)
        .is("return_date", null)
        .single();

      if (fetchError || !issuedBook) {
        toast.error("No active issue record found for this book");
        setIsLoading(false);
        return;
      }

      // Calculate late fine
      const today = new Date();
      const endDate = new Date(issuedBook.end_date);
      const daysLate = Math.max(0, differenceInDays(today, endDate));
      const lateFine = daysLate * 50; // ₹50 per day

      // Validate damage fine
      const damageFineAmount = isDamaged ? Math.min(parseFloat(damageFine) || 0, 500) : 0;
      const totalFine = lateFine + damageFineAmount;

      // Update issued_books record
      const { error: updateIssueError } = await supabase
        .from("issued_books")
        .update({
          return_date: format(today, "yyyy-MM-dd"),
          late_fine: lateFine,
          damage_fine: damageFineAmount,
          total_fine: totalFine,
        })
        .eq("id", issuedBook.id);

      if (updateIssueError) throw updateIssueError;

      // Update book status to Available
      const { error: updateBookError } = await supabase
        .from("books")
        .update({ status: "Available" })
        .eq("id", book.id);

      if (updateBookError) throw updateBookError;

      let message = `${book.title} has been returned successfully!`;
      if (totalFine > 0) {
        message += ` Total fine: ₹${totalFine}`;
        if (lateFine > 0) message += ` (Late: ₹${lateFine}`;
        if (damageFineAmount > 0) message += `${lateFine > 0 ? ", " : " ("}Damage: ₹${damageFineAmount}`;
        message += ")";
      }

      toast.success(message);
      onSuccess();
      onOpenChange(false);
      setIsDamaged(false);
      setDamageFine("0");
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
          <DialogDescription>
            Process the return for <strong>{book?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="damaged" 
              checked={isDamaged}
              onCheckedChange={(checked) => setIsDamaged(checked as boolean)}
            />
            <label
              htmlFor="damaged"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Book is damaged
            </label>
          </div>

          {isDamaged && (
            <div className="grid gap-2">
              <Label htmlFor="damage-fine">Damage Fine (Max ₹500)</Label>
              <Input
                id="damage-fine"
                type="number"
                min="0"
                max="500"
                value={damageFine}
                onChange={(e) => setDamageFine(e.target.value)}
                placeholder="Enter damage fine amount"
              />
              <p className="text-xs text-muted-foreground">
                Late fine will be calculated automatically at ₹50 per day
              </p>
            </div>
          )}

          {!isDamaged && (
            <p className="text-sm text-muted-foreground">
              Late fine will be calculated automatically at ₹50 per day if the book is returned after the due date.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReturn} disabled={isLoading}>
            {isLoading ? "Processing..." : "Return Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
