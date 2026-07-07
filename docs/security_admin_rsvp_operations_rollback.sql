-- Restore the previous database surface only after reverting the frontend to
-- direct administrative RSVP mutations.

begin;

drop function if exists public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb
);
drop function if exists public.admin_delete_guest_rsvp(uuid);

grant insert, update, delete on table public.rsvps to authenticated;

commit;
