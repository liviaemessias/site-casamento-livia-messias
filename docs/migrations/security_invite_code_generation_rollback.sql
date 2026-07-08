-- Restores the previous database surface. The frontend must be reverted to
-- direct guest inserts before this rollback is executed.

begin;

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer
);

grant insert on table public.guests to authenticated;

commit;
