# LA CASA DEL ACCESORIO — Showroom

Vitrina Next.js con un sedán de muestra, giro 360°, catálogo editable y cotización por WhatsApp. En local puede usar un JSON. En Vercel el catálogo, el WhatsApp y las fotos viven en Supabase.

## Desarrollo
```bash
npm install
cp .env.example .env.local
npm run dev
```
Abrir http://localhost:3000.

## Conectar Supabase
1. Crear el proyecto en Supabase.
2. Pegar `supabase/schema.sql` entero en SQL Editor y ejecutarlo. Se puede repetir si ya corriste una versión anterior.
3. En Project Settings > API copiar:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, nunca el navegador)
4. Pegar las tres claves en `.env.local`. Cambia `ADMIN_PIN` y `ADMIN_SECRET`.
5. Reiniciar `npm run dev`.
6. Entrar a `/admin`, guardar el catálogo y el número de WhatsApp. La home y el catálogo leen esos datos; si Realtime está activo, se actualizan sin recargar.
7. Para el catálogo de autos (fotos y videos de trabajos), ejecutar también `supabase/schema-cars.sql`. En `/admin` → Resultados de autos se suben las fichas.

## Vercel
Subir a GitHub, importar en Vercel y definir las mismas variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PIN`
- `ADMIN_SECRET`

Redeplegar. Sin `SUPABASE_SERVICE_ROLE_KEY` el showroom se ve, pero `/admin` no puede guardar ni subir fotos.

## Límites
Las fotos y el giro 360 son de un sedán genérico de muestra, no de un Toyota Corolla. Precio y disponibilidad se confirman en taller.
