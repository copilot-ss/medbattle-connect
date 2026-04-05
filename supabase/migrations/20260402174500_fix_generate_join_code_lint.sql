create or replace function public.generate_join_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  digits constant text := '23456789';
  code text := '';
begin
  for letter_idx in 1..3 loop
    code := code || substr(letters, floor(random() * length(letters))::int + 1, 1);
  end loop;

  for digit_idx in 1..2 loop
    code := code || substr(digits, floor(random() * length(digits))::int + 1, 1);
  end loop;

  return code;
end;
$$;
