-- Add RLS policies for certificates management by admins
CREATE POLICY "Admins can insert certificates"
ON public.certificates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update certificates"
ON public.certificates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete certificates"
ON public.certificates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));