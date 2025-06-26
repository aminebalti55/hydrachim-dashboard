-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('basse', 'moyenne', 'haute');

-- CreateEnum
CREATE TYPE "Gravite" AS ENUM ('mineur', 'modere', 'majeur', 'critique');

-- CreateEnum
CREATE TYPE "TypeKpi" AS ENUM ('pointage', 'efficacite', 'securite');

-- CreateEnum
CREATE TYPE "TypePeriode" AS ENUM ('hebdomadaire', 'mensuelle');

-- CreateEnum
CREATE TYPE "TypeProduit" AS ENUM ('matiere_premiere', 'emballage');

-- CreateEnum
CREATE TYPE "EtatStock" AS ENUM ('ok', 'abime', 'expire');

-- CreateEnum
CREATE TYPE "TypeValeur" AS ENUM ('pourcentage', 'valeur', 'temps');

-- CreateEnum
CREATE TYPE "CategorieLogistique" AS ENUM ('transport', 'stockage', 'retour', 'main_oeuvre', 'autre');

-- CreateEnum
CREATE TYPE "StatutEntrepot" AS ENUM ('actif', 'inactif', 'maintenance');

-- CreateEnum
CREATE TYPE "TypeKpiGlobal" AS ENUM ('percentage', 'number', 'time', 'currency');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" UUID NOT NULL,
    "nom_utilisateur" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions_utilisateur" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "heure_connexion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sessions_utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pointages" (
    "id" UUID NOT NULL,
    "employe_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "entree" TIME,
    "sortie" TIME,
    "heures_travail" DOUBLE PRECISION,
    "productivite" SMALLINT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pointages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efficacites" (
    "id" UUID NOT NULL,
    "employe_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "efficacite" SMALLINT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efficacites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taches" (
    "id" UUID NOT NULL,
    "employe_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "priorite" "Priorite",
    "duree_estimee_minutes" INTEGER,
    "terminee" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents_securite" (
    "id" UUID NOT NULL,
    "employe_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "heure" TIME,
    "type" TEXT,
    "gravite" "Gravite",
    "description" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_securite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistiques_kpi" (
    "id" UUID NOT NULL,
    "type_kpi" "TypeKpi" NOT NULL,
    "date" DATE NOT NULL,
    "valeur" INTEGER,
    "donnees" JSONB,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistiques_kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets_developpement" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "duree_cible_semaines" DECIMAL(5,2) NOT NULL,
    "termine" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projets_developpement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_developpement" (
    "id" UUID NOT NULL,
    "date_kpi" DATE NOT NULL,
    "kpi_global" SMALLINT NOT NULL,
    "projets_total" INTEGER NOT NULL,
    "projets_termines" INTEGER NOT NULL,
    "projets_en_cours" INTEGER NOT NULL,
    "projets_retard" INTEGER NOT NULL,
    "projets_a_temps" INTEGER NOT NULL,
    "taux_reussite" SMALLINT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_developpement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formules" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "date_creation" DATE NOT NULL,
    "date_completion" DATE,
    "reussie" BOOLEAN NOT NULL DEFAULT false,
    "iterations" INTEGER NOT NULL DEFAULT 0,
    "responsable" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_formulation" (
    "id" UUID NOT NULL,
    "date_kpi" DATE NOT NULL,
    "formules_total" INTEGER NOT NULL,
    "formules_completees" INTEGER NOT NULL,
    "objectif_mensuel" INTEGER NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_formulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_kpi_rnd" (
    "id" UUID NOT NULL,
    "type_periode" "TypePeriode" NOT NULL,
    "valeur_periode" TEXT NOT NULL,
    "moyenne_dev" INTEGER NOT NULL,
    "moyenne_formules" INTEGER NOT NULL,
    "total_projets" INTEGER NOT NULL,
    "total_formules" INTEGER NOT NULL,
    "objectifs_realises" INTEGER NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_kpi_rnd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receptions_matiere_premiere" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "heure" TIME NOT NULL,
    "nom_produit" TEXT NOT NULL,
    "type_produit" "TypeProduit" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "conforme" BOOLEAN,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receptions_matiere_premiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_receptions" (
    "id" UUID NOT NULL,
    "debut_semaine" DATE NOT NULL,
    "fin_semaine" DATE NOT NULL,
    "valeur_kpi" SMALLINT NOT NULL,
    "objectif_hebdo" INTEGER NOT NULL DEFAULT 90,
    "total_receptions" INTEGER NOT NULL,
    "conformes" INTEGER NOT NULL,
    "non_conformes" INTEGER NOT NULL,
    "en_attente" INTEGER NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_receptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaspillage_production" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "type_gaspillage" TEXT NOT NULL,
    "quantite_kg" DOUBLE PRECISION NOT NULL,
    "cause" TEXT,
    "commentaire" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gaspillage_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_gaspillage" (
    "id" UUID NOT NULL,
    "debut_semaine" DATE NOT NULL,
    "fin_semaine" DATE NOT NULL,
    "total_kg_perdu" DOUBLE PRECISION NOT NULL,
    "moyenne_journaliere" DOUBLE PRECISION NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_gaspillage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controle_stock_qualite" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "nom_article" TEXT NOT NULL,
    "numero_lot" TEXT,
    "etat" "EtatStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "remarques" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "controle_stock_qualite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_stock_qualite" (
    "id" UUID NOT NULL,
    "debut_semaine" DATE NOT NULL,
    "fin_semaine" DATE NOT NULL,
    "total_articles_verifies" INTEGER NOT NULL,
    "conformes" INTEGER NOT NULL,
    "non_conformes" INTEGER NOT NULL,
    "taux_conformite" SMALLINT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_stock_qualite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_qualite" (
    "id" UUID NOT NULL,
    "type_periode" "TypePeriode" NOT NULL,
    "valeur_periode" TEXT NOT NULL,
    "qualite_moyenne" INTEGER NOT NULL,
    "taux_conformite_moyen" INTEGER NOT NULL,
    "total_tests" INTEGER NOT NULL,
    "sessions_controle" INTEGER NOT NULL,
    "objectifs_atteints" INTEGER NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_qualite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donnees_production" (
    "id" UUID NOT NULL,
    "kpi_id" TEXT NOT NULL,
    "valeur" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "donnees_json" JSONB,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donnees_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_production" (
    "id" TEXT NOT NULL,
    "nom_fr" TEXT NOT NULL,
    "description_fr" TEXT,
    "type" "TypeValeur" NOT NULL,
    "cible" DECIMAL(10,2) NOT NULL,
    "unite" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "kpi_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapport_hebdomadaire_production" (
    "id" UUID NOT NULL,
    "semaine_iso" TEXT NOT NULL,
    "production_moyenne" DECIMAL(5,2),
    "production_totale" INTEGER,
    "efficacite_moyenne" DECIMAL(5,2),
    "sessions" INTEGER,
    "objectifs_atteints" INTEGER,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapport_hebdomadaire_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapport_mensuel_production" (
    "id" UUID NOT NULL,
    "mois" TEXT NOT NULL,
    "production_moyenne" DECIMAL(5,2),
    "kpis_analyse" JSONB,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapport_mensuel_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consommation_energie" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "zone" TEXT NOT NULL,
    "consommation_kwh" DECIMAL(10,2) NOT NULL,
    "commentaires" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consommation_energie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problemes_stock" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "heure" TIME NOT NULL,
    "description" TEXT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problemes_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_problemes_stock" (
    "id" UUID NOT NULL,
    "date_semaine" DATE NOT NULL,
    "objectif_hebdo" INTEGER NOT NULL DEFAULT 5,
    "total_problemes" INTEGER NOT NULL,
    "valeur_kpi" SMALLINT NOT NULL,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_problemes_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couts_logistique" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "categorie" "CategorieLogistique" NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "commentaire" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couts_logistique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_couts_logistique" (
    "id" UUID NOT NULL,
    "periode_type" "TypePeriode" NOT NULL,
    "periode_valeur" TEXT NOT NULL,
    "cout_total" DECIMAL(12,2) NOT NULL,
    "moyenne_journaliere" DECIMAL(10,2),
    "objectif" DECIMAL(10,2),
    "depassement" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_couts_logistique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrepots" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "capacite_maximum" INTEGER NOT NULL,
    "capacite_actuelle" INTEGER NOT NULL,
    "statut" "StatutEntrepot" NOT NULL DEFAULT 'actif',
    "localisation" TEXT,
    "responsable" TEXT,
    "cree_le" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrepots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_entries" (
    "id" UUID NOT NULL,
    "department_id" TEXT NOT NULL,
    "kpi_id" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "data" JSONB,
    "notes" TEXT,
    "date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_fr" TEXT,
    "description_en" TEXT,
    "unit" TEXT,
    "target_value" DECIMAL(10,2),
    "kpi_type" "TypeKpiGlobal" NOT NULL,
    "tracking_type" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("department_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_nom_utilisateur_key" ON "utilisateurs"("nom_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_entries_department_id_kpi_id_date_key" ON "kpi_entries"("department_id", "kpi_id", "date");

-- AddForeignKey
ALTER TABLE "sessions_utilisateur" ADD CONSTRAINT "sessions_utilisateur_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efficacites" ADD CONSTRAINT "efficacites_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents_securite" ADD CONSTRAINT "incidents_securite_employe_id_fkey" FOREIGN KEY ("employe_id") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_entries" ADD CONSTRAINT "kpi_entries_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
