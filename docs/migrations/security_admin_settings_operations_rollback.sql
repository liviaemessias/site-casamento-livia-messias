-- Restore direct administrative settings mutations only after reverting the
-- frontend to its previous implementation.

begin;

drop function if exists public.admin_save_settings(
  text,
  text,
  text,
  text,
  integer,
  jsonb
);
drop index if exists public.settings_singleton_idx;

grant insert, update, delete on table public.settings to authenticated;

commit;
