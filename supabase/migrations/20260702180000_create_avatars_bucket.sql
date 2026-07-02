-- El bucket 'avatars' tenia politicas RLS ya creadas pero el bucket en si
-- nunca se llego a crear. Lo creamos como publico para que las fotos de
-- perfil se puedan servir con una URL directa.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
