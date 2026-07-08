-- Restore direct administrative guest mutations only after reverting the
-- frontend to its previous implementation.

begin;

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer
);
drop function if exists public.admin_set_guest_active(uuid, boolean);

grant update, delete on table public.guests to authenticated;

commit;
