# Quedada — Plan del MVP

App móvil estilo "tablón de corcho" para apuntarse a planes con desconocidos (no ligar). Mobile-first, una sola cuenta con roles activables (Usuario / Anfitrión / Empresa). Backend con Lovable Cloud (auth real, Storage para avatares, Realtime para chats).

## 1. Sistema de diseño (lo primero)

Antes de cualquier pantalla, defino los tokens en `src/styles.css`:

- Fondo corcho: gradiente `#B98F52 → #8E6A3B` + textura sutil (SVG noise) aplicada al `body`.
- Tokens semánticos por categoría de papel:
  - `--paper-sport` `#CFE7B0`, `--paper-social` `#F6BBA0`, `--paper-language` `#AEDCEF`, `--paper-outdoor` `#F5DD8C`, `--paper-culture` `#DECBEF`.
- Acento chincheta: `--pin-red` `#C1432F`. Washi tape: variantes translúcidas.
- Tipografía: `Caveat` (títulos manuscritos) + `DM Sans` (cuerpo), cargadas vía `<link>` en `__root.tsx` (no `@import` remoto en CSS).
- Componente `<PaperNote category rotation>`: papel con sombra suave, ligera rotación (-3°…+3°), chincheta roja arriba-centro y un trozo de washi tape en una esquina (pseudo-elementos).
- Botones tipo "sello de goma": `rounded-full`, borde grueso, sombra interna, tipografía Caveat.
- Bottom nav fija (5 tabs): Descubrir · Crear · Mis planes · Anfitrión · Perfil.

## 2. Backend (Lovable Cloud)

Activo Lovable Cloud y creo el esquema:

- `profiles` (linked a auth.users): name, age, city, bio, avatar_url, interests text[], is_host, is_company, company_name. Trigger `handle_new_user`.
- `plans`: creator_id, category, title, description, location, date, time, max_people, is_hosted, host_id, activity_id, company_name, commission_per_person.
- `plan_participants` (pk: plan_id+user_id), `messages` (chat realtime).
- `activities_catalog` (seed con las 6 actividades del brief).
- `host_reviews`, `ads` (con `impressions`).
- RLS en todas: lectura pública de `plans`, `profiles` (campos visibles), `activities_catalog`, `ads`; escritura solo del dueño; participantes solo ven mensajes de planes a los que pertenecen.
- `GRANT` explícitos a `authenticated` y `anon` donde toque.
- Storage bucket público `avatars` con políticas (usuario sube/actualiza su carpeta `{user_id}/`).
- Realtime habilitado en `messages` y `plan_participants`.

Seed en migración: 3 anfitriones de ejemplo con reseñas, 12-15 planes repartidos entre las 5 categorías (algunos "oficiales" con actividad de catálogo).

## 3. Autenticación

- Email/contraseña con `emailRedirectTo: window.location.origin`.
- Ruta pública `/auth` (login + signup) y subárbol `_authenticated/` para todo lo demás.
- Onboarding obligatorio tras signup si el perfil está incompleto: nombre, edad, ciudad, foto (subida real a Storage), intereses (multi entre las 5 categorías), bio opcional.

## 4. Pantallas / rutas

```
/auth                          login + signup
/_authenticated/onboarding     wizard de perfil
/_authenticated/                Descubrir (mazo swipe)
/_authenticated/crear           Crear plan
/_authenticated/mis-planes      Lista de planes propios y apuntados
/_authenticated/plan/$id        Detalle + chat realtime
/_authenticated/anfitrion       Catálogo de actividades + ganancias
/_authenticated/empresa         Directorio de anfitriones + anuncios
/_authenticated/perfil          Perfil, toggles de rol, logout
/_authenticated/u/$id           Perfil ampliado de otro usuario
```

### Descubrir
- Mazo de cartas (papel pinado) con swipe táctil (Framer Motion: drag + velocity → derecha=apuntarse, izquierda=paso).
- Filtro por categoría arriba (chips de papel).
- Cada 6-10 swipes se inserta una carta de anuncio a pantalla completa; al verla incrementa `impressions`.
- Estado vacío: nota grande "No quedan planes, ¡crea uno!".

### Crear plan
- Formulario validado con zod (categoría, título, descripción, lugar, fecha, hora, aforo).

### Mis planes
- Dos secciones: "Voy" y "Organizo".
- Detalle: tira horizontal de avatares (tap → perfil ampliado), chat realtime debajo.

### Anfitrión
- Toggle en perfil para activarlo.
- Catálogo (6 actividades del brief) → elegir → fecha/hora/lugar/aforo → publica plan con insignia "🌟 Oficial".
- Panel "Ganancias": total y desglose (`commission_per_person × participantes` excluyendo al anfitrión).

### Empresa
- Toggle en perfil pidiendo `company_name`.
- Directorio de anfitriones ordenado por rating con: foto, valoración media, nº reseñas, tráfico (suma de participantes en sus planes), nº planes organizados.
- Ficha individual con reseñas y formulario para dejar una (1-5 + comentario).
- Anuncios: crear (título + mensaje), ver impresiones.

## 5. Realtime

- Suscripción a `messages` filtrada por `plan_id` en la pantalla de chat.
- Suscripción a `plan_participants` para actualizar el contador "X personas van" en vivo.

## 6. Stack técnico

- TanStack Start + TanStack Query (loaders + `useSuspenseQuery`).
- Server functions (`createServerFn` con `requireSupabaseAuth`) para lecturas/escrituras sensibles del feed, anuncios y panel de ganancias.
- Cliente Supabase del navegador para auth, Realtime y Storage uploads.
- Framer Motion para swipe y micro-animaciones (papel "cayendo" al descartar).

## 7. Entrega por fases

Lo construyo en este orden, sin parar entre fases:

1. Sistema de diseño + shell (bottom nav, layout corcho, componente PaperNote).
2. Cloud + esquema + RLS + seed + Storage.
3. Auth + onboarding con upload real.
4. Descubrir (swipe) + Crear plan.
5. Mis planes + chat realtime + perfil ampliado.
6. Rol Anfitrión (catálogo + publicar oficial + ganancias).
7. Rol Empresa (directorio + reseñas + anuncios en feed).
8. Pulido: estados vacíos, errores, SEO básico, sitemap.

## Detalles técnicos (referencia)

- No hay pagos: comisiones son solo contables (campos en `plans`, agregación en panel).
- `is_host` / `is_company` se almacenan en `profiles` y gobiernan visibilidad de tabs/secciones; no es un sistema de roles de seguridad (los toggles los activa el propio usuario, sin privilegios elevados).
- Las reseñas de empresa→anfitrión requieren `is_company=true` (RLS).
- Anuncios visibles para todos los autenticados; sólo el dueño puede crear/borrar los suyos.
- Avatares: bucket público `avatars`, ruta `{user_id}/avatar.jpg`, política de upload restringida a la carpeta del propio uid.

¿Le doy luz verde y empiezo por el sistema de diseño + Cloud, o quieres ajustar algo (categorías, actividades semilla, copy, tabs)?
