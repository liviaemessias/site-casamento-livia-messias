-- ============================================================
-- Vendor financial delete guard
-- ============================================================
--
-- Prevents deleting a vendor while it is linked to financial real expenses.
-- Linked vendors should be hidden or manually unlinked from expenses first.

create or replace function public.admin_delete_vendor(target_vendor_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.financial_expenses
    where vendor_id = target_vendor_id
  ) then
    raise exception 'Vendor is linked to financial expenses and cannot be deleted.'
      using errcode = '23503';
  end if;

  delete from public.wedding_vendors
  where id = target_vendor_id;

  if not found then
    raise exception 'Vendor not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

revoke all on function public.admin_delete_vendor(uuid) from public, anon;
grant execute on function public.admin_delete_vendor(uuid) to authenticated;
