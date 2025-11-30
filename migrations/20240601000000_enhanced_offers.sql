-- Create offers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    flag_id UUID NOT NULL REFERENCES public.flags(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    sent_at TIMESTAMPTZ DEFAULT now(),
    respond_by TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Policies

-- Insert: Authenticated users can insert if they are the sender
CREATE POLICY "Users can insert their own offers" ON public.offers
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Select: Users can see offers they sent or received
CREATE POLICY "Users can view offers they sent or received" ON public.offers
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Update: Senders can update their own offers (e.g. cancel, edit message)
CREATE POLICY "Senders can update their own offers" ON public.offers
    FOR UPDATE USING (auth.uid() = sender_id);

-- Update: Receivers can update status (accept/decline)
-- Note: Ideally we'd restrict columns, but RLS doesn't support column-level granularity easily without triggers or separate roles.
-- For now, we allow receivers to update rows where they are the receiver.
CREATE POLICY "Receivers can update offers sent to them" ON public.offers
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Delete: Senders can delete their own offers
CREATE POLICY "Senders can delete their own offers" ON public.offers
    FOR DELETE USING (auth.uid() = sender_id);

-- Create helper function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
