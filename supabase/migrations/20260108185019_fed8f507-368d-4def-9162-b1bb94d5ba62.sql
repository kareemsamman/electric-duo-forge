-- Add RLS policies for team table management
CREATE POLICY "Admins can insert team members"
ON public.team FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team members"
ON public.team FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team members"
ON public.team FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));