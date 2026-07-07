-- Restore direct settings reads only after reverting every frontend caller.

begin;

drop function if exists public.get_public_settings();
drop function if exists public.get_public_event_settings();

grant select on table public.settings to authenticated;

drop policy if exists settings_select_authenticated on public.settings;
create policy settings_select_authenticated
on public.settings
for select
to authenticated
using (public.current_guest_id() is not null or public.is_admin());

commit;
