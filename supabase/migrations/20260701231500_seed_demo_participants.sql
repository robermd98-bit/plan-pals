-- Seed de plan_participants para que el stack de avatares tenga datos visibles en demo

WITH seed(title, participant_idx) AS (
  VALUES
    ('Pádel en Retiro', 2), ('Pádel en Retiro', 3), ('Pádel en Retiro', 4),
    ('Running por el río', 1), ('Running por el río', 5),
    ('Escalada indoor', 6), ('Escalada indoor', 7),
    ('Cañas de jueves', 8), ('Cañas de jueves', 9), ('Cañas de jueves', 10),
    ('Cena italiana', 3), ('Cena italiana', 4),
    ('Brunch dominical', 7), ('Brunch dominical', 8), ('Brunch dominical', 10),
    ('Intercambio inglés-español', 9), ('Intercambio inglés-español', 4),
    ('Conversation club', 1), ('Conversation club', 2), ('Conversation club', 3),
    ('Senderismo La Pedriza', 6), ('Senderismo La Pedriza', 5),
    ('Visita al Reina Sofía', 9), ('Visita al Reina Sofía', 8),
    ('Visita a la Sagrada Familia', 3), ('Visita a la Sagrada Familia', 7), ('Visita a la Sagrada Familia', 10)
),
demo_users(idx, uid) AS (
  VALUES
    (1,  '11111111-1111-1111-1111-000000000001'::uuid),
    (2,  '11111111-1111-1111-1111-000000000002'::uuid),
    (3,  '11111111-1111-1111-1111-000000000003'::uuid),
    (4,  '11111111-1111-1111-1111-000000000004'::uuid),
    (5,  '11111111-1111-1111-1111-000000000005'::uuid),
    (6,  '11111111-1111-1111-1111-000000000006'::uuid),
    (7,  '11111111-1111-1111-1111-000000000007'::uuid),
    (8,  '11111111-1111-1111-1111-000000000008'::uuid),
    (9,  '11111111-1111-1111-1111-000000000009'::uuid),
    (10, '11111111-1111-1111-1111-00000000000a'::uuid)
)
INSERT INTO public.plan_participants (plan_id, user_id)
SELECT p.id, u.uid
FROM seed s
JOIN public.plans p ON p.title = s.title
JOIN demo_users u ON u.idx = s.participant_idx
WHERE p.creator_id <> u.uid
ON CONFLICT DO NOTHING;
