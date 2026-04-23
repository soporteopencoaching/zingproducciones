-- Tabla de eventos
create table eventos (
  id uuid default gen_random_uuid() primary key,
  slug text unique,
  nombre text not null,
  fecha date,
  foto_portada_url text,
  fotos_book text[] default '{}',
  link_subir_foto text,
  link_descargar_foto text,
  activo boolean default false,
  created_at timestamp with time zone default now()
);

-- Sin RLS (datos no sensibles, solo fotos de eventos)
alter table eventos disable row level security;
