-- Restore direct administrative gift mutations only after reverting the
-- frontend to its previous implementation.

begin;

drop function if exists public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
);
drop function if exists public.admin_delete_gift(uuid);

grant insert, update, delete on table public.gifts to authenticated;

commit;
