-- Seed data for locations table
INSERT INTO locations (id, user_id, latitude, longitude, timestamp, address, shared_with_guardians)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', -23.55052, -46.633308, NOW(), 'São Paulo, SP', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', -22.906847, -43.172896, NOW(), 'Rio de Janeiro, RJ', false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', -19.916681, -43.934493, NOW(), 'Belo Horizonte, MG', true); 