# LA CASA DEL ACCESORIO — Showroom

## Qué contiene
- Next.js: vitrina con un sedán tuneado de muestra y giro 360° (36 fotogramas).
- Puntos sobre el auto para abrir la ficha de cada pieza. Cotización por WhatsApp.
- Catálogo de un producto, enlace WhatsApp configurable, panel admin con Supabase Auth.
- Sin Supabase, la web pública funciona en modo demo; `/admin` indica cómo conectar.

## Requisitos
Node.js 20+ y proyecto Supabase propio.

## Desarrollo
```bash
npm install
cp .env.example .env.local
npm run dev
```
Abrir http://localhost:3000.

## Habilitar persistencia y admin
1. Crear proyecto Supabase.
2. Ejecutar `supabase/schema.sql` en SQL Editor una sola vez (si existen políticas, revisar antes de reejecutar).
3. En Authentication > Users, crear un usuario con correo y contraseña segura. Deshabilitar registro público en Auth Settings si no se requiere.
4. En SQL Editor, ejecutar `insert into public.admin_users(user_id) values ('UUID_DEL_USUARIO');`.
5. Copiar Project URL y **anon/publishable key** a `.env.local` usando los nombres del ejemplo. No usar service_role en frontend.
6. Reiniciar servidor, ingresar a `/admin`, modificar precio, disponibilidad, imagen y WhatsApp. Verificar desde otro navegador y tras recarga.
7. Para cambios en vivo entre sesiones, habilitar `supabase_realtime` para las tablas `products` y `shop_settings`. Sin ello, los cambios se muestran al recargar.

## Publicación
Subir a GitHub, desplegar en Vercel, definir las dos variables NEXT_PUBLIC_... en la configuración del proyecto y redeplegar. Revisar políticas RLS y autenticación antes de compartir /admin.

## Límites
Las fotos y el giro 360 son de un sedán genérico de muestra, no de un Toyota Corolla. El precio y la disponibilidad son demostrativos y no constituyen una oferta comercial.

## Verificación manual sugerida
- Arrastrar el auto en 360°, pausar/reanudar, tocar un punto y abrir ficha.
- Configurar número real y verificar el mensaje precargado de WhatsApp.
