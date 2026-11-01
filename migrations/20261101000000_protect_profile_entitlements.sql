-- MANUAL REVIEW REQUIRED. Not applied by this change.
-- Run in a disposable/staging Supabase database first; then verify the checklist
-- in docs/security-and-demo-validation.md before scheduling a production migration.
BEGIN;

CREATE OR REPLACE FUNCTION public.protect_profile_entitlements()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Service-role requests and trusted SQL maintenance retain entitlement access.
  IF auth.role() IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'free';
      NEW.focus_score := 0;
      NEW.focus_tier := 'Blurry';
      NEW.cocredit_balance := 0;
      NEW.is_verified := false;
      NEW.stripe_customer_id := NULL;
    ELSIF ROW(NEW.role, NEW.focus_score, NEW.focus_tier,
              NEW.cocredit_balance, NEW.is_verified, NEW.stripe_customer_id)
          IS DISTINCT FROM
          ROW(OLD.role, OLD.focus_score, OLD.focus_tier,
              OLD.cocredit_balance, OLD.is_verified, OLD.stripe_customer_id) THEN
      RAISE EXCEPTION 'Profile entitlements can only be changed by trusted server operations'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_entitlements ON public.profiles;
CREATE TRIGGER protect_profile_entitlements
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_entitlements();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscriptions_insert_policy ON public.subscriptions;
-- The only subscription writes should come from a verified server-side provider.
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;

COMMIT;
