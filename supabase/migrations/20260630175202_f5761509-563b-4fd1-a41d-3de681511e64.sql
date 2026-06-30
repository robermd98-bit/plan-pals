
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
SELECT v.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'demo' || v.n || '@quedada.local', crypt('demo-no-login-' || v.n, gen_salt('bf')), now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('name', v.name), now(), now()
FROM (VALUES
  ('11111111-1111-1111-1111-000000000001'::uuid, 1, 'Lucía'),
  ('11111111-1111-1111-1111-000000000002'::uuid, 2, 'Marcos'),
  ('11111111-1111-1111-1111-000000000003'::uuid, 3, 'Elena'),
  ('11111111-1111-1111-1111-000000000004'::uuid, 4, 'Javier'),
  ('11111111-1111-1111-1111-000000000005'::uuid, 5, 'Andrea'),
  ('11111111-1111-1111-1111-000000000006'::uuid, 6, 'Pablo'),
  ('11111111-1111-1111-1111-000000000007'::uuid, 7, 'Sofía'),
  ('11111111-1111-1111-1111-000000000008'::uuid, 8, 'Diego'),
  ('11111111-1111-1111-1111-000000000009'::uuid, 9, 'Carmen'),
  ('11111111-1111-1111-1111-00000000000a'::uuid, 10, 'Hugo')
) AS v(id, n, name)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, age, city, bio, interests)
VALUES
  ('11111111-1111-1111-1111-000000000001','Lucía',26,'Madrid','Me encantan los planes espontáneos.', ARRAY['deporte','social']),
  ('11111111-1111-1111-1111-000000000002','Marcos',31,'Barcelona','Siempre liado pero apuntado a todo.', ARRAY['social','cultura']),
  ('11111111-1111-1111-1111-000000000003','Elena',28,'Valencia','Nueva en la ciudad, busco gente maja.', ARRAY['idiomas','social']),
  ('11111111-1111-1111-1111-000000000004','Javier',34,'Sevilla','Café, libros y conversación.', ARRAY['cultura','idiomas']),
  ('11111111-1111-1111-1111-000000000005','Andrea',29,'Bilbao','Runner los domingos, vermut después.', ARRAY['deporte','social']),
  ('11111111-1111-1111-1111-000000000006','Pablo',24,'Málaga','Aprendiendo idiomas con cualquier excusa.', ARRAY['idiomas','aire_libre']),
  ('11111111-1111-1111-1111-000000000007','Sofía',32,'Zaragoza','Más de sierra que de playa.', ARRAY['aire_libre','deporte']),
  ('11111111-1111-1111-1111-000000000008','Diego',27,'Granada','Friki de los juegos de mesa.', ARRAY['social','cultura']),
  ('11111111-1111-1111-1111-000000000009','Carmen',30,'Alicante','Cine en versión original siempre.', ARRAY['cultura','idiomas']),
  ('11111111-1111-1111-1111-00000000000a','Hugo',35,'Pamplona','Brunch los sábados, sin falta.', ARRAY['social','aire_libre'])
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, age=EXCLUDED.age, city=EXCLUDED.city, bio=EXCLUDED.bio, interests=EXCLUDED.interests;

WITH data(rn, category, title, description, location, max_people) AS (VALUES
  (1,'deporte','Pádel en Retiro','Partido de dobles, nivel medio. Llevo palas de sobra.','Club Pádel Retiro, Madrid',4),
  (2,'deporte','Running por el río','5km suaves al atardecer, paramos a estirar.','Puente de Triana, Sevilla',8),
  (3,'deporte','Pachanga de fútbol','Faltan 3 para completar equipos. Botellín al acabar.','Polideportivo La Mar, Valencia',10),
  (4,'deporte','Ruta en bici eléctrica','Vuelta de 20km, fácil. Alquilamos en grupo.','Casa de Campo, Madrid',6),
  (5,'deporte','Escalada indoor','Sesión para iniciados, alquilamos pies de gato.','Sputnik Climbing, Barcelona',5),
  (6,'deporte','Yoga en el parque','Esterilla y ganas. Profe amiga nos guía.','Parc de la Ciutadella, Barcelona',12),
  (7,'deporte','Baloncesto 3x3','Pista al aire libre, traer agua.','Plaza de Lavapiés, Madrid',6),
  (8,'deporte','Pilates al amanecer','7:00 con vistas al mar.','Playa de la Malagueta, Málaga',8),
  (9,'deporte','Surf para principiantes','Clase compartida con monitor.','Playa de Somo, Cantabria',6),
  (10,'deporte','Pádel mixto domingo','Buscamos pareja, nivel iniciación.','Padelmania, Zaragoza',4),
  (11,'social','Cañas de jueves','Tarde tranquila, conocernos sin prisas.','La Latina, Madrid',8),
  (12,'social','Cena italiana','Probamos una trattoria nueva, dividimos cuenta.','Gracia, Barcelona',6),
  (13,'social','Vermut sabatino','Aperitivo en plaza, picamos algo.','Mercado Central, Valencia',10),
  (14,'social','Karaoke nocturno','Cantamos hasta quedarnos afónicos.','Calle Pez, Madrid',8),
  (15,'social','Brunch dominical','Tortitas y mimosas, plan tranqui.','Born, Barcelona',6),
  (16,'social','Noche de juegos de mesa','Catan, Codenames y cervezas.','Generación X, Madrid',8),
  (17,'social','Tapas en el Casco Viejo','Ruta de pintxos clásica.','Casco Viejo, Bilbao',10),
  (18,'social','After-work coctelería','Viernes para empezar el finde bien.','Triball, Madrid',8),
  (19,'social','Pizza y peli en mi casa','Salón grande, traer bebida.','Malasaña, Madrid',6),
  (20,'social','Cata de vinos','Aprender de la mano de un sommelier amigo.','Chueca, Madrid',8),
  (21,'idiomas','Intercambio inglés-español','Mitad y mitad, ambiente relajado.','Café Comercial, Madrid',12),
  (22,'idiomas','Stammtisch alemán','Conversación nivel B1+, no apto para empezar.','Bar Berlín, Barcelona',8),
  (23,'idiomas','Italiano para viajeros','Frases útiles para escapar a Italia.','Lavapiés, Madrid',10),
  (24,'idiomas','Café en francés','Solo francés durante 90 minutos.','Le Père, Valencia',8),
  (25,'idiomas','Japonés para curiosos','Repasamos hiragana mientras tomamos té.','Tetería Kioto, Granada',6),
  (26,'idiomas','Portugués de Brasil','Caipirinhas y conversación.','Barrio Húmedo, León',8),
  (27,'idiomas','Charla en inglés C1','Tema fijo cada semana, debatimos.','Soho House, Barcelona',10),
  (28,'idiomas','Catalán para guiris','Iniciación divertida, sin presión.','Born, Barcelona',10),
  (29,'idiomas','Euskera básico','Aprender saludos y números.','Casco Viejo, Bilbao',8),
  (30,'idiomas','Conversation club','Mix de idiomas, mesa por nivel.','Coworking Utopicus, Madrid',15),
  (31,'aire_libre','Senderismo La Pedriza','Ruta circular de 12km, dificultad media.','La Pedriza, Madrid',10),
  (32,'aire_libre','Picnic en el parque','Cada uno trae algo para compartir.','El Retiro, Madrid',15),
  (33,'aire_libre','Kayak por el Sella','Descenso clásico, comida incluida.','Arriondas, Asturias',8),
  (34,'aire_libre','Setas de otoño','Recolección guiada por experto.','Sierra de Guadarrama',10),
  (35,'aire_libre','Avistamiento de estrellas','Llevamos telescopio y mantas.','Embalse de El Atazar',12),
  (36,'aire_libre','Ruta en piragua','Pantano tranquilo, ideal para empezar.','Embalse de San Juan',8),
  (37,'aire_libre','Vía ferrata fácil','Equipo de alquiler, monitor incluido.','Montserrat, Barcelona',6),
  (38,'aire_libre','Baño en pozas','Día de río, bocata y siesta al sol.','Sierra de Gredos',12),
  (39,'aire_libre','Camping de fin de semana','Una noche, tienda compartida.','Parque Natural Cazorla',8),
  (40,'aire_libre','Paseo a caballo','Una hora por el monte, todos los niveles.','Hípica La Dehesa, Sevilla',6),
  (41,'cultura','Visita al Reina Sofía','Vemos el Guernica y más, café después.','Museo Reina Sofía, Madrid',8),
  (42,'cultura','Cine en V.O.','Película de autor + debate posterior.','Cines Verdi, Barcelona',10),
  (43,'cultura','Club de lectura','Comentamos "Los detectives salvajes".','Tipos Infames, Madrid',12),
  (44,'cultura','Concierto de jazz','Local pequeño, ambiente íntimo.','Café Central, Madrid',8),
  (45,'cultura','Ruta de street art','Paseo guiado por murales urbanos.','Lavapiés, Madrid',15),
  (46,'cultura','Visita a la Sagrada Familia','Entradas reservadas, audioguía compartida.','Sagrada Familia, Barcelona',6),
  (47,'cultura','Teatro independiente','Obra corta, cañas después en la plaza.','Teatro Lara, Madrid',8),
  (48,'cultura','Exposición de fotografía','Recorrido tranquilo, charla en café.','La Fábrica, Madrid',10),
  (49,'cultura','Ópera para principiantes','Entradas en zona alta, buen ambiente.','Teatro Real, Madrid',6),
  (50,'cultura','Visita guiada Alhambra','Reserva confirmada, mañana completa.','Alhambra, Granada',8)
),
creators(idx, uid) AS (VALUES
  (0,'11111111-1111-1111-1111-000000000001'::uuid),
  (1,'11111111-1111-1111-1111-000000000002'::uuid),
  (2,'11111111-1111-1111-1111-000000000003'::uuid),
  (3,'11111111-1111-1111-1111-000000000004'::uuid),
  (4,'11111111-1111-1111-1111-000000000005'::uuid),
  (5,'11111111-1111-1111-1111-000000000006'::uuid),
  (6,'11111111-1111-1111-1111-000000000007'::uuid),
  (7,'11111111-1111-1111-1111-000000000008'::uuid),
  (8,'11111111-1111-1111-1111-000000000009'::uuid),
  (9,'11111111-1111-1111-1111-00000000000a'::uuid)
)
INSERT INTO public.plans (creator_id, category, title, description, location, date, time, max_people, is_hosted)
SELECT c.uid, d.category, d.title, d.description, d.location,
       (CURRENT_DATE + ((d.rn % 30) + 1))::date,
       (TIME '10:00:00' + ((d.rn % 12)) * INTERVAL '1 hour'),
       d.max_people,
       (d.rn % 6 = 0)
FROM data d
JOIN creators c ON c.idx = (d.rn - 1) % 10;
