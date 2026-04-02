

## Fix: Restrict attendance table access

**Problem**: The scanner flags that the `attendance` table's single `ALL` policy on `{authenticated}` with `has_role(admin)` lacks an explicit denial for non-admin users and anonymous access. While the existing policy functionally blocks non-admins (the `USING` clause fails), the scanner wants explicit restriction.

**Solution**: Add a `RESTRICTIVE` policy denying all access to `anon` users (matching the pattern used on `employees`). The existing admin-only `ALL` policy already blocks non-admin authenticated users via the `has_role` check, but adding the anon denial makes the intent explicit and satisfies the scanner.

### Migration

```sql
CREATE POLICY "Anon users cannot access attendance"
ON public.attendance AS RESTRICTIVE FOR ALL TO anon
USING (false) WITH CHECK (false);
```

### Details
- Single migration adding one restrictive RLS policy
- No code changes needed — this is database-level only
- Matches the existing pattern on the `employees` table
- Mark the `attendance_authenticated_read_exposure` finding as resolved

