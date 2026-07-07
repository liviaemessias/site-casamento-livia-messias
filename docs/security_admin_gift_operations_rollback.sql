-- Restore the previous database surface only after reverting the frontend to
-- direct administrative gift and contribution mutations.

begin;

drop function if exists public.admin_confirm_gift_purchase(uuid);
drop function if exists public.admin_release_gift_reservation(uuid);
drop function if exists public.admin_confirm_gift_contribution(uuid);
drop function if exists public.admin_release_gift_contribution(uuid);

grant insert, update, delete
  on table public.gift_contributions
  to authenticated;

commit;
