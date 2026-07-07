-- ============================================================
-- Remove the legacy guests.is_admin authorization flag
-- ============================================================
--
-- Before running this migration, execute the updated scripts:
--   1. security_invite_code_generation.sql
--   2. security_admin_guest_operations.sql
--
-- Administrative authorization remains in public.admin_users and the
-- public.is_admin() function. This migration does not remove either one.

begin;

do $$
begin
  if to_regprocedure(
    'public.create_guest_with_invite_code(text,text,jsonb,integer)'
  ) is null then
    raise exception
      'Run the updated security_invite_code_generation.sql first.';
  end if;

  if to_regprocedure(
    'public.admin_update_guest(uuid,text,text,jsonb,integer)'
  ) is null then
    raise exception
      'Run the updated security_admin_guest_operations.sql first.';
  end if;
end;
$$;

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
);

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
);

alter table public.guests
  drop column if exists is_admin;

commit;

