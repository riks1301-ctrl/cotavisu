-- Políticas RLS para a tabela profiles
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Trigger para criar perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  )
  on conflict (id) do update
    set name = excluded.name,
        role = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

-- Cria o trigger no auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
