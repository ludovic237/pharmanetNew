ALTER TABLE `concerner`
  ADD COLUMN `prix_unit` int null;

UPDATE `concerner`
SET `prix_unit` = `prixUnit`;

ALTER TABLE `depense`
  add column date_delivrance datetime  null,
    add column date_depense    datetime  null,
    add column lieu_delivrance varchar(100) null,
    add column numero_cni      varchar(100) null,
    add column prix_unitaire   int          null,
    add column type_depense    int          null;

UPDATE `depense`
SET `date_delivrance` = `dateDelivrance`,
    `date_depense`    = `dateDepense`,
    `lieu_delivrance` = `lieuDelivrance`,
    `numero_cni`      = `numeroCni`,
    `prix_unitaire`   = `prixUnitaire`,
    `type_depense`    = `typeDepense`;

ALTER TABLE `commande`
  ADD COLUMN date_creation  datetime null,
    ADD COLUMN date_livraison datetime null,
    ADD COLUMN montant_cmd    double   null,
    ADD COLUMN montant_recu   double   null,
    ADD COLUMN qtite_cmd      int      null,
    ADD COLUMN qtite_recu     int      null,
    ADD COLUMN unite_gratuite int      null;

UPDATE `commande`
SET `date_creation`  = `dateCreation`,
    `date_livraison` = `dateLivraison`,
    `montant_cmd`    = `montantCmd`,
    `montant_recu`   = `montantRecu`,
    `qtite_cmd`      = `qtiteCmd`,
    `qtite_recu`     = `qtiteRecu`,
    `unite_gratuite` = `uniteGratuite`;

ALTER TABLE `facture_electronique`
  ADD COLUMN numero_telephone varchar(15) null;

UPDATE `facture_electronique`
SET `numero_telephone` = `numeroTelephone`;


ALTER TABLE `inventaire`
  ADD COLUMN date_debut datetime null,
    ADD COLUMN date_fin   datetime null;

UPDATE `inventaire`
SET `date_debut` = `dateDebut`,
    `date_fin`   = `dateFin`;

ALTER TABLE `ligne_commande`
  ADD COLUMN date_derniere datetime null;

UPDATE `ligne_commande`
SET `date_derniere` = `dateDerniere`;

ALTER TABLE `concerner`
  ADD COLUMN `prix_unit` VARCHAR(32);
UPDATE `concerner`
SET `prix_unit` = `prixUnit`;


ALTER TABLE `produit`
  add column code_laborex   varchar(32)   null,
    add column code_ubipharm  varchar(32)   null,
    add column contenu_detail varchar(10)   null,
    add column prix_detail    varchar(10)   null,
    add column reduction_max  int default 0 null,
    add column stock_max      int           null,
    add column stock_min      int           null;

UPDATE `produit`
SET `code_laborex`   = `codeLaborex`,
    `code_ubipharm`  = `codeUbipharm`,
    `contenu_detail` = `contenuDetail`,
    `prix_detail`    = `prixDetail`,
    `reduction_max`  = `reductionMax`,
    `stock_max`      = `stockMax`,
    `stock_min`      = `stockMin`;

ALTER TABLE `produit_cmd`
  add column prix_public    double null,
    add column pt_cmd         double null,
    add column pt_recept      double null,
    add column pu_cmd         double null,
    add column pu_recept      double null,
    add column qtite_cmd      int    null,
    add column qtite_recu     int    null,
    add column unite_gratuite int    null;

UPDATE `produit_cmd`
SET `prix_public`    = `prixPublic`,
    `pt_cmd`         = `ptCmd`,
    `pt_recept`      = `ptRecept`,
    `pu_cmd`         = `puCmd`,
    `pu_recept`      = `puRecept`,
    `qtite_cmd`      = `qtiteCmd`,
    `qtite_recu`     = `qtiteRecu`,
    `unite_gratuite` = `uniteGratuite`;

ALTER TABLE `ticket_caisse`
  add column date_genere date null;

UPDATE `ticket_caisse`
SET `date_genere` = `dateGenere`;

ALTER TABLE `sortie_stock`
  add column date_sortie datetime null;

UPDATE `sortie_stock`
SET `date_sortie` = `dateSortie`;

ALTER TABLE `produit1`
  add column date_cmd        datetime null,
    add column date_peremption datetime null,
    add column prix_achat      double      null,
    add column prix_public     double      null,
    add column stock_mag       int         null,
    add column stock_max       int         null,
    add column stock_min       int         null;

UPDATE `produit1`
SET `date_cmd`        = `dateCmd`,
    `date_peremption` = `datePeremption`,
    `prix_achat`      = `prixAchat`,
    `prix_public`     = `prixPublic`,
    `stock_mag`       = `stockMag`,
    `stock_max`       = `stockMax`,
    `stock_min`       = `stockMin`;

ALTER TABLE `produit_detail`
    add column reduction_max       int         null,
    add column stock_max       int         null,
    add column stock_min       int         null;

UPDATE `produit_detail`
SET `reduction_max`        = `reductionMax`,
    `stock_max`       = `stockMax`,
    `stock_min`       = `stockMin`;

ALTER TABLE `user`
  add column reduction_max int null;

UPDATE `user`
SET `reduction_max` = `reductionMax`;

ALTER TABLE `employe`
  add column faire_reduction_max int null;

UPDATE `employe`
SET employe.`faire_reduction_max` = `faireReductionMax`;


ALTER TABLE `caisse`
  add column date_ferme         datetime  null,
    add column date_ouvert        datetime  null,
    add column fermeture_caisse   varchar(255) null,
    add column fond_caisse_ferme  double       null,
    add column fond_caisse_ouvert double       null,
    add column ouverture_caisse   varchar(255) null;

UPDATE `caisse`
SET `date_ferme`         = `dateFerme`,
    `date_ouvert`        = `dateOuvert`,
    `fermeture_caisse`   = `fermetureCaisse`,
    `fond_caisse_ferme`  = `fondCaisseFerme`,
    `fond_caisse_ouvert` = `fondCaisseOuvert`,
    `ouverture_caisse`   = `ouvertureCaisse`;


ALTER TABLE `en_rayon`
  add column date_livraison    datetime   null,
                        add column date_peremption   datetime   null,
                        add column prix_achat        int           null,
                        add column prix_vente        int           null,
                        add column quantite_restante int           null;

UPDATE `en_rayon`
SET
  `date_livraison`        = `dateLivraison`,
  `date_peremption`   = `datePeremption`,
  `prix_achat`  = `prixAchat`,
  `prix_vente` = `prixVente`,
  `quantite_restante`   = `quantiteRestante`;


ALTER TABLE `bon_caisse`
  add column date_encaisser datetime null,
    add column date_generer   datetime null;

UPDATE `bon_caisse`
SET `date_encaisser` = `dateEncaisser`,
    `date_generer`   = `dateGenerer`;


ALTER TABLE `history`
  add column date_histo datetime    null,
    add column type_histo varchar(64) not null;

UPDATE `history`
SET `date_histo` = `dateHisto`,
    `type_histo` = `typeHisto`;


ALTER TABLE `ligne_caisse`
  add column date_ligne  datetime not null,
    add column ref_produit int      not null;

UPDATE `ligne_caisse`
SET `date_ligne`  = `dateLigne`,
    `ref_produit` = `refProduit`;


ALTER TABLE `produit_inventaire`
  add column stock_avant  int null,
    add column stock_valide int null;

UPDATE `produit_inventaire`
SET `stock_avant`  = `stockAvant`,
    `stock_valide` = `stockValide`;


ALTER TABLE `transaction`
  add column date_transac datetime null;

UPDATE `transaction`
SET `date_transac` = `dateTransac`;

ALTER TABLE `malade`
  add column mode_reglement varchar(32) not null,
    add column code_postal_id int         null;

UPDATE `malade`
SET `mode_reglement` = `modeReglement`,
    `code_postal_id` = `CodePostal_id`;

ALTER TABLE `pharmacy`
  add column code_postal_id int null;

UPDATE `pharmacy`
SET `code_postal_id` = `CodePostal_id`;


ALTER TABLE `vente`
  add column date_encaissement datetime null,
    add column date_vente        datetime null,
    add column prix_percu        double      null,
    add column prix_total        double      null;

UPDATE `vente`
SET `date_encaissement` = `dateEncaissement`,
    `date_vente`        = `dateVente`,
    `prix_percu`        = `prixPercu`,
    `prix_total`        = `prixTotal`;


ALTER TABLE `facturation`
  add column date_facture  datetime  null,
    add column montant_percu int          null,
    add column montant_ttc   int          null,
    add column type_paiement varchar(100) null;

UPDATE `facturation`
SET `date_facture`  = `dateFacture`,
    `montant_percu` = `montantPercu`,
    `montant_ttc`   = `montantTtc`,
    `type_paiement` = `typePaiement`;


ALTER TABLE `produit_vendu`
  add column prix_unit   double null,
    add column qtite_vendu int    null;

UPDATE `produit_vendu`
SET `prix_unit`   = `prixUnit`,
    `qtite_vendu` = `qtiteVendu`;


ALTER TABLE `retour_produit`
  add column date_retour datetime null;

UPDATE `retour_produit`
SET `date_retour` = `dateRetour`;

CREATE TABLE audit_logs
(
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT       NULL,
  action       VARCHAR(50)  NULL,
  method_name  VARCHAR(255) NULL,
  arguments    longtext,
  result       LONGTEXT,
  exception    longtext,
  timestamp    DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_date datetime     null,
  updated_date datetime     null
);

alter table inventaire
  add column employe_id       int       null,
  add column rayon_id       int       null,
  add column categorie_id    int       null,
  add column fabriquant_id   int       null,
  add column forme_id        int       null,
  add column fournisseur_id  int       null,
  add column commentaire   varchar(255) null,
  add foreign key (employe_id ) references employe (id),
  add foreign key (rayon_id ) references rayon (id),
  add foreign key (categorie_id ) references categorie (id),
  add foreign key (fabriquant_id ) references fabriquant (id),
  add foreign key (forme_id ) references forme (id),
  add foreign key (fournisseur_id ) references fournisseur (id);

alter table user
  add password varchar(255) not null ,
  add username varchar(255) not null,
  modify password varchar(255) null,
  modify username varchar(255) null;

alter table facturation
  modify id bigint auto_increment;
