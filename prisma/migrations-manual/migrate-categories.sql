-- Migration: Consolidation des catégories en 3 catégories principales
-- Téléphonie, Informatique, Impression
-- À exécuter sur la base de données de production

BEGIN;

-- 1. Créer les 3 nouvelles catégories
INSERT INTO categories (id, name, description, icon, "displayOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Téléphonie', 'Téléphonie mobile, fixe, internet et communications unifiées', 'phone', 1, NOW(), NOW()),
  (gen_random_uuid(), 'Informatique', 'Cloud, hébergement, logiciels, sauvegarde et cyber-sécurité', 'monitor', 2, NOW(), NOW()),
  (gen_random_uuid(), 'Impression', 'Solutions d''impression et reprographie', 'printer', 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Déplacer les services vers les nouvelles catégories
DO $$
DECLARE
  telephonie_id TEXT;
  informatique_id TEXT;
  impression_id TEXT;
BEGIN
  -- Récupérer les IDs des nouvelles catégories
  SELECT id INTO telephonie_id FROM categories WHERE name = 'Téléphonie' AND "deletedAt" IS NULL LIMIT 1;
  SELECT id INTO informatique_id FROM categories WHERE name = 'Informatique' AND "deletedAt" IS NULL LIMIT 1;
  SELECT id INTO impression_id FROM categories WHERE name = 'Impression' AND "deletedAt" IS NULL LIMIT 1;

  -- === TÉLÉPHONIE ===
  -- Téléphonie Mobile → Téléphonie
  UPDATE services SET "categoryId" = telephonie_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Téléphonie Mobile');

  -- Téléphonie Fixe → Téléphonie
  UPDATE services SET "categoryId" = telephonie_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Téléphonie Fixe');

  -- Internet & Réseau → Téléphonie
  UPDATE services SET "categoryId" = telephonie_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Internet & Réseau');

  -- Communications Unifiées → Téléphonie
  UPDATE services SET "categoryId" = telephonie_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Communications Unifiées');

  -- === INFORMATIQUE ===
  -- Cloud & Hébergement → Informatique
  UPDATE services SET "categoryId" = informatique_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Cloud & Hébergement');

  -- Logiciels & Licences → Informatique
  UPDATE services SET "categoryId" = informatique_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Logiciels & Licences');

  -- Sauvegarde → Informatique
  UPDATE services SET "categoryId" = informatique_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Sauvegarde');

  -- Cyber-Sécurité → Informatique
  UPDATE services SET "categoryId" = informatique_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Cyber-Sécurité');

  -- Matériel → Informatique (si existe)
  UPDATE services SET "categoryId" = informatique_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Matériel');

  -- === IMPRESSION ===
  -- Solution D'Impression → Impression
  UPDATE services SET "categoryId" = impression_id, "updatedAt" = NOW()
  WHERE "categoryId" IN (SELECT id FROM categories WHERE name = 'Solution D''Impression');

  -- Soft delete des anciennes catégories
  UPDATE categories
  SET "deletedAt" = NOW(), "updatedAt" = NOW()
  WHERE name IN (
    'Téléphonie Mobile',
    'Téléphonie Fixe',
    'Internet & Réseau',
    'Communications Unifiées',
    'Cloud & Hébergement',
    'Logiciels & Licences',
    'Sauvegarde',
    'Cyber-Sécurité',
    'Matériel',
    'Solution D''Impression'
  ) AND "deletedAt" IS NULL;

  RAISE NOTICE 'Migration terminée !';
  RAISE NOTICE 'Téléphonie ID: %', telephonie_id;
  RAISE NOTICE 'Informatique ID: %', informatique_id;
  RAISE NOTICE 'Impression ID: %', impression_id;
END $$;

-- 3. Vérification finale
SELECT
  c.name as categorie,
  c."displayOrder" as ordre,
  COUNT(s.id) as nb_services
FROM categories c
LEFT JOIN services s ON s."categoryId" = c.id AND s."deletedAt" IS NULL
WHERE c."deletedAt" IS NULL
GROUP BY c.id, c.name, c."displayOrder"
ORDER BY c."displayOrder";

COMMIT;
