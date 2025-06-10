create table if not exists budget
(
  id      int auto_increment
    primary key,
  nom     varchar(32) not null,
  prenom  varchar(32) not null,
  montant int         not null
);

create table if not exists categorie
(
  id        int auto_increment
    primary key,
  nom       varchar(32)   not null,
  supprimer int default 0 not null
);

create table if not exists concerner
(
  id          int auto_increment
    primary key,
  vente_id    bigint                          null,
  produit_id  int                             null,
  en_rayon_id int                             null,
  prixUnit    int                             null,
  quantite    int                             null,
  reduction   int                             null,
  supprimer   int          default 0          null,
  type        varchar(255) default 'en rayon' null
)
  charset = latin1;

create table if not exists correspondre
(
  ID_VENTE int not null,
  ID_FAC   int not null
);

create table if not exists depense
(
  id             int auto_increment
    primary key,
  caisse_id      varchar(10)   null,
  designation    varchar(255)  null,
  quantite       int           null,
  prixUnitaire   int           null,
  dateDepense    date          null,
  beneficiaire   varchar(100)  null,
  numeroCni      varchar(100)  null,
  dateDelivrance date          null,
  lieuDelivrance varchar(100)  null,
  societe        varchar(100)  null,
  typeDepense    int           null,
  supprimer      int default 0 null
)
  charset = latin1;

create table if not exists en_rayon_inventaire
(
  id                  bigint auto_increment
    primary key,
  inventaire_id       int           null,
  en_rayon_id         varchar(255)  null,
  employe_id          int           null,
  quantite_rayon      int           null,
  quantite_inventaire int           null,
  date_debut          datetime      null,
  date_fin            datetime      null,
  type                varchar(100)  null,
  statut              varchar(100)  null,
  supprimer           int default 0 null
);

create table if not exists fabriquant
(
  id         int auto_increment
    primary key,
  code       varchar(16)   null,
  nom        varchar(32)   null,
  adresse    varchar(32)   null,
  telephone  varchar(32)   null,
  email      varchar(32)   null,
  codepostal varchar(20)   null,
  supprimer  int default 0 null,
  constraint UNIQ_CFF97A3A6C6E55B5
    unique (nom),
  constraint UNIQ_CFF97A3A77153098
    unique (code)
);

create table if not exists facture_electronique
(
  id              int auto_increment
    primary key,
  facturation_id  bigint        null,
  numeroTelephone varchar(15)   null,
  montant         int           null,
  supprimer       int default 0 null
)
  charset = latin1;

create table if not exists facture_espece
(
  id             int auto_increment
    primary key,
  facturation_id bigint        null,
  montant        int           null,
  supprimer      int default 0 null
)
  charset = latin1;

create table if not exists facture_ticket
(
  id               int auto_increment
    primary key,
  facturation_id   bigint        null,
  ticket_caisse_id int           null,
  montant          int           null,
  supprimer        int default 0 null
)
  charset = latin1;

create table if not exists forme
(
  id        int auto_increment
    primary key,
  code      varchar(16)   null,
  nom       varchar(32)   null,
  supprimer int default 0 not null
);

create table if not exists fournisseur
(
  id         int auto_increment
    primary key,
  code       varchar(16)   null,
  nom        varchar(32)   null,
  statut     varchar(32)   null,
  codepostal varchar(20)   null,
  adresse    varchar(32)   null,
  telephone  varchar(32)   null,
  email      varchar(32)   null,
  supprimer  int default 0 null,
  constraint UNIQ_369ECA3277153098
    unique (code)
);

create table if not exists commande
(
  id             bigint auto_increment
    primary key,
  employe_id     int           null,
  dateCreation   datetime      null,
  dateLivraison  datetime      null,
  note           varchar(255)  null,
  fournisseur_id int           null,
  qtiteCmd       int           null,
  qtiteRecu      int           null,
  uniteGratuite  int           null,
  montantCmd     double        null,
  montantRecu    double        null,
  etat           varchar(32)   null,
  ref            varchar(32)   null,
  supprimer      int default 0 null,
  constraint FK_6EEAA67D670C757F
    foreign key (fournisseur_id) references fournisseur (id)
);

create table if not exists en_rayon
(
  id               int auto_increment
    primary key,
  produit_id       int           null,
  rayon_id   int           null,
  fournisseur_id   int           null,
  unite_id   int           null,
  commande_id      bigint        null,
  dateLivraison    datetime      null,
  datePeremption   date          null,
  prixAchat        int           null,
  prixVente        int           null,
  reduction        int           null,
  quantite         int           null,
  quantiteRestante int           null,
  supprimer        int default 0 null
);

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

create table if not exists gerer
(
  ID_UTI     bigint not null,
  ID_PRODUIT bigint not null
)
  charset = latin1;

create table if not exists inventaire
(
  id        int auto_increment
    primary key,
  dateDebut datetime      null,
  dateFin   datetime      null,
  etat      varchar(15)   null,
  supprimer int default 0 null
)
  charset = latin1;

create table if not exists license
(
  id  int auto_increment
    primary key,
  cle datetime not null
);

create table if not exists ligne_commande
(
  id           int auto_increment
    primary key,
  type         varchar(50)   null,
  dateDerniere datetime      null,
  supprimer    int default 0 not null
)
  charset = latin1;

create table if not exists magasin
(
  id        int auto_increment
    primary key,
  code      varchar(16)   not null,
  nom       varchar(32)   not null,
  supprimer int default 0 not null
);

create table if not exists message
(
  id          int auto_increment
    primary key,
  type        varchar(32) null,
  description varchar(64) null,
  datemsg     datetime    null
);

create table if not exists prescripteur
(
  id        int auto_increment
    primary key,
  nom       varchar(255)  null,
  structure varchar(255)  null,
  adresse   varchar(255)  null,
  telephone varchar(255)  null,
  supprimer int default 0 null
);

create table if not exists produit_detail
(
  id             int auto_increment
    primary key,
  reference      varchar(32)   null,
  nom            varchar(50)   not null,
  stock          int           not null,
  stockMax       int           not null,
  stockMin       int           not null,
  reductionMax   int default 0 not null,
  prix           int           not null,
  grossiste_list varchar(100)  not null,
  supprimer      int default 0 not null
)
  charset = latin1;

create table if not exists rayon
(
  id        int auto_increment
    primary key,
  code      varchar(16)   not null,
  nom       varchar(32)   not null,
  supprimer int default 0 not null
);

create table if not exists produit
(
  id            int auto_increment
    primary key,
  ean13         varchar(16)                 null,
  codeLaborex   varchar(32)                 null,
  codeUbipharm  varchar(32)                 null,
  reference     varchar(32)                 null,
  nom           varchar(50)                 null,
  stock         int                         null,
  stockMax      int                         null,
  stockMin      int                         null,
  contenuDetail varchar(10)                 null,
  prixDetail    varchar(10)                 null,
  etat          varchar(10) default 'Utile' null,
  reductionMax  int         default 0       null,
  grossiste_id  varchar(100)                null,
  detail_id     int                         null,
  categorie_id  int                         null,
  forme_id      int                         null,
  fabriquant_id int                         null,
  rayon_id      int                         null,
  etagere       varchar(15)                 null,
  magasin_id    int                         null,
  created_at    datetime                    null,
  updated_at    datetime                    null,
  supprimer     int         default 0       null
);

create table if not exists produit_cmd
(
  id            int auto_increment
    primary key,
  prixPublic    double        null,
  produit_id    int           null,
  commande_id   bigint        null,
  puCmd         double        null,
  ptCmd         double        null,
  qtiteCmd      int           null,
  puRecept      double        null,
  ptRecept      double        null,
  qtiteRecu     int           null,
  uniteGratuite int           null,
  etat          varchar(255)  null,
  supprimer     int default 0 null,
  constraint produit_cmd_ibfk_1
    foreign key (produit_id) references produit (id)
);

create table if not exists ticket_caisse
(
  id         int auto_increment
    primary key,
  codebarre  int           null,
  montant    int           null,
  dateGenere date          null,
  statut     varchar(15)   null,
  validite   int           null,
  supprimer  int default 0 null
)
  charset = latin1;

create table if not exists type_depense
(
  id          int auto_increment
    primary key,
  nom         varchar(100)  null,
  description varchar(255)  null,
  supprimer   int default 0 null
)
  charset = latin1;

create table if not exists type_sortie
(
  id          int auto_increment
    primary key,
  nom         varchar(100)  null,
  description varchar(255)  null,
  supprimer   int default 0 null
)
  charset = latin1;

create table if not exists sortie_stock
(
  id             int auto_increment
    primary key,
  en_rayon_id    int           null,
  type_sortie_id int           null,
  quantite       int           null,
  dateSortie     datetime      null,
  detail_id      varchar(20)   null,
  supprimer      int default 0 null
)
  charset = latin1;

create table if not exists unite
(
  id        int auto_increment
    primary key,
  nom       varchar(16)   null,
  libelle   varchar(32)   null,
  supprimer int default 0 not null
);

create table if not exists produit1
(
  id             int auto_increment
    primary key,
  ean13          varchar(16)  not null,
  reference      varchar(32)  not null,
  nom            varchar(32)  null,
  contenance     varchar(255) not null,
  stock          int          null,
  stockMax       int          null,
  stockMin       int          null,
  datePeremption datetime     null,
  dateCmd        datetime     null,
  stockMag       int          null,
  prixPublic     double       null,
  prixAchat      double       null,
  categorie_id   int          null,
  forme_id       int          null,
  fabriquant_id  int          null,
  fournisseur_id int          null,
  rayon_id       int          null,
  magasin_id     int          null,
  unite_id       int          null,
  constraint FK_29A5EC2720096AE3
    foreign key (magasin_id) references magasin (id),
  constraint FK_29A5EC275E0C7E7D
    foreign key (fabriquant_id) references fabriquant (id),
  constraint FK_29A5EC27670C757F
    foreign key (fournisseur_id) references fournisseur (id),
  constraint FK_29A5EC27BCE84E7C
    foreign key (forme_id) references forme (id),
  constraint FK_29A5EC27BCF5E72D
    foreign key (categorie_id) references categorie (id),
  constraint FK_29A5EC27D3202E52
    foreign key (rayon_id) references rayon (id),
  constraint FK_29A5EC27EC4A74AB
    foreign key (unite_id) references unite (id)
);

create table if not exists user
(
  id                int auto_increment
    primary key,
  nom               varchar(100)            null,
  prenom            varchar(100)            null,
  email             varchar(150)            null,
  password          varchar(255)            not null,
  fonction          varchar(64)             null,
  telephone         varchar(32)             null,
  reduction         int                     null,
  reductionMax      int                     null,
  role              tinytext                not null,
  birthday          datetime                null,
  gender            enum ('male', 'female') null,
  image             varchar(255)            null,
  is_active         boolean                 not null default true,
  is_deleted        boolean                 not null default false,
  registration_date datetime                not null,
  joined_date       datetime                null,
  created_date      datetime                null,
  updated_date      datetime                null,
  username          varchar(255)            not null,
  unique (username),
  unique (email),
  supprimer         int                              default 0 not null
);

create table if not exists employe
(
  id                int auto_increment
    primary key,
  identifiant       varchar(100)  null,
  password          varchar(50)   null,
  codebarre_id      varchar(255)  null,
  type              varchar(100)  null,
  user_id           int           null,
  etat              varchar(20)   null,
  faireReductionMax int           null,
  supprimer         int default 0 null,
  constraint employe_ibfk_1
    foreign key (user_id) references user (id)
)
  charset = latin1;

create table if not exists caisse
(
  id               int auto_increment
    primary key,
  employe_id       int           null,
  ouvertureCaisse  varchar(255)  null,
  fermetureCaisse  varchar(255)  null,
  dateOuvert       datetime      null,
  dateFerme        datetime      null,
  session          varchar(32)   null,
  fondCaisseOuvert double        null,
  fondCaisseFerme  double        null,
  etat             varchar(16)   null,
  supprimer        int default 0 null,
  constraint caisse_ibfk_1
    foreign key (employe_id) references employe (id)
);

create table if not exists bon_caisse
(
  id                  int auto_increment
    primary key,
  caisse_id           int           null,
  caisse_id_encaisser int           null,
  nom_client          varchar(100)  null,
  codebarre_id        varchar(50)   null,
  montant             int           null,
  dateGenerer         datetime      null,
  dateEncaisser       datetime      null,
  type                varchar(50)   null,
  supprimer           int default 0 null,
  constraint bon_caisse_ibfk_1
    foreign key (caisse_id) references caisse (id)
)
  charset = latin1;

create table if not exists history
(
  id          int auto_increment
    primary key,
  produit_id  int         null,
  user_id     int         null,
  dateHisto   datetime    null,
  description varchar(64) null,
  quantite    int         not null,
  typeHisto   varchar(64) not null,
  constraint FK_27BA704BA76ED395
    foreign key (user_id) references user (id),
  constraint FK_27BA704BF347EFB
    foreign key (produit_id) references produit (id)
);

create table if not exists ligne_caisse
(
  id         int auto_increment
    primary key,
  caisse_id  int          null,
  produit_id int          null,
  libelle    varchar(255) not null,
  dateLigne  datetime     not null,
  debit      double       null,
  credit     double       null,
  type       varchar(32)  not null,
  refProduit int          not null,
  motif      varchar(128) not null,
  constraint FK_9479CF8E27B4FEBF
    foreign key (caisse_id) references caisse (id),
  constraint ligne_caisse_ibfk_1
    foreign key (produit_id) references produit (id)
);

create table if not exists produit_inventaire
(
  id            int auto_increment
    primary key,
  inventaire_id int           null,
  employe_id    int           null,
  en_rayon_id   int           null,
  stockAvant    int           null,
  stockValide   int           null,
  date_debut    datetime      null,
  date_fin      datetime      null,
  type          varchar(100)  null,
  statut        varchar(100)  null,
  supprimer     int default 0 not null
);

create table if not exists transaction
(
  id          int auto_increment
    primary key,
  user_id     int          null,
  montant     double       not null,
  type        varchar(32)  not null,
  note        varchar(128) not null,
  dateTransac datetime     not null

);

create table if not exists ville
(
  id        int auto_increment
    primary key,
  nom       varchar(32)   not null,
  code      varchar(16)   null,
  supprimer int default 0 not null
);

create table if not exists code_postal
(
  id       int auto_increment
    primary key,
  code     varchar(16) null,
  nom      varchar(32) not null,
  Ville_id int         null
);

create table if not exists malade
(
  id             int auto_increment
    primary key,
  nom            varchar(32)   null,
  telephone      varchar(32)   not null,
  modeReglement  varchar(32)   not null,
  poid           double        not null,
  taille         double        not null,
  code_postal_id int           null,
  reduction      varchar(32)   not null,
  supprimer      int default 0 not null,
  constraint FK_A5563102F83E1E74
    foreign key (code_postal_id) references code_postal (id)
);

create table if not exists pharmacy
(
  id             int auto_increment
    primary key,
  nom            varchar(64)  null,
  telephone      varchar(128) not null,
  adresse        varchar(128) not null,
  logo           varchar(64)  not null,
  code_postal_id int          null,
  slogan         varchar(128) not null,
  docteur        varchar(128) not null,
  contribuable   varchar(128) not null
);

create table if not exists vente
(
  id               bigint auto_increment
    primary key,
  prixTotal        double        null,
  prixPercu        double        null,
  dateVente        datetime      null,
  dateEncaissement datetime      null,
  commentaire      varchar(255)  null,
  malade_id        int           null,
  etat             varchar(16)   DEFAULT 'EN_COURS',
  reference        varchar(16)   null,
  nouveau_info     varchar(16)   null,
  user_id          int           null,
  prescripteur_id  int           null,
  employe_id       int           null,
  reduction        varchar(32)   null,
  caisse_id        int           null,
  supprimer        int default 0 null
);

create table if not exists facturation
(
  id           int auto_increment
    primary key,
  vente_id     bigint        null,
  caisse_id    int           null,
  typePaiement varchar(100)  null,
  montantPercu int           null,
  reste        int           null,
  montantTtc   int           null,
  dateFacture  datetime      null,
  supprimer    int default 0 null
);

create table if not exists produit_vendu
(
  id         int auto_increment
    primary key,
  qtiteVendu int    null,
  tva        double null,
  prixUnit   double null,
  montantTTC double null,
  produit_id int    null,
  vente_id   bigint null
);

create table if not exists retour_produit
(
  id         int auto_increment
    primary key,
  vente_id   bigint        null,
  employe_id int           null,
  caisse_id  int           null,
  dateRetour datetime      null,
  supprimer  int default 0 null
);

create table if not exists produit_retour
(
  id                int auto_increment
    primary key,
  retour_produit_id int           null,
  concerner_id      int           null,
  quantite          int           null,
  supprimer         int default 0 null
);

create or replace definer = root@localhost view pharma_concerner_view as
select `ven`.`id`                AS `venteId`,
       `conc`.`quantite`         AS `quantite`,
       `conc`.`prixUnit`         AS `prixUnit`,
       `conc`.`reduction`        AS `reduction`,
       `ven`.`reference`         AS `reference`,
       `ven`.`prixPercu`         AS `prixPercu`,
       `ven`.`prixTotal`         AS `prixTotal`,
       `en_r`.`prixAchat`        AS `prixAchat`,
       `en_r`.`prixVente`        AS `prixVente`,
       `en_r`.`dateLivraison`    AS `dateLivraison`,
       `en_r`.`datePeremption`   AS `datePeremption`,
       `en_r`.`quantite`         AS `quantiteRayon`,
       `en_r`.`quantiteRestante` AS `quantiteRestante`,
       `pdt`.`nom`               AS `nom`,
       `ven`.`dateVente`         AS `dateVente`
from (((`concerner` `conc` join `vente` `ven`
        on ((`conc`.`vente_id` = `ven`.`id`))) join `en_rayon` `en_r`
       on ((`conc`.`en_rayon_id` = `en_r`.`id`))) join `produit` `pdt`
      on ((`pdt`.`id` = `en_r`.`produit_id`)));

create or replace definer = root@localhost view pharma_concerner_without_return_view as
select `ven`.`id`                AS `venteId`,
       `conc`.`quantite`         AS `quantite`,
       `conc`.`prixUnit`         AS `prixUnit`,
       `conc`.`reduction`        AS `reduction`,
       `ven`.`reference`         AS `reference`,
       `ven`.`prixPercu`         AS `prixPercu`,
       `ven`.`prixTotal`         AS `prixTotal`,
       `en_r`.`prixAchat`        AS `prixAchat`,
       `en_r`.`prixVente`        AS `prixVente`,
       `en_r`.`dateLivraison`    AS `dateLivraison`,
       `en_r`.`datePeremption`   AS `datePeremption`,
       `en_r`.`quantite`         AS `quantiteRayon`,
       `en_r`.`quantiteRestante` AS `quantiteRestante`,
       `pdt`.`nom`               AS `nom`,
       `ven`.`dateVente`         AS `dateVente`
from (((`concerner` `conc` join `vente` `ven`
        on ((`conc`.`vente_id` = `ven`.`id`))) join `en_rayon` `en_r`
       on ((`conc`.`en_rayon_id` = `en_r`.`id`))) join `produit` `pdt`
      on ((`pdt`.`id` = `en_r`.`produit_id`)))
where (`conc`.`vente_id` = 0 in (select `retour_produit`.`vente_id` from `retour_produit`));

create or replace definer = root@localhost view pharma_concerner_without_vente_view as
select `conc`.`quantite`         AS `quantite`,
       `conc`.`prixUnit`         AS `prixUnit`,
       `conc`.`reduction`        AS `reduction`,
       `en_r`.`prixAchat`        AS `prixAchat`,
       `en_r`.`prixVente`        AS `prixVente`,
       `en_r`.`dateLivraison`    AS `dateLivraison`,
       `en_r`.`datePeremption`   AS `datePeremption`,
       `en_r`.`quantite`         AS `quantite_rayon`,
       `en_r`.`quantiteRestante` AS `quantiteRestante`,
       `pdt`.`nom`               AS `nom`
from ((`concerner` `conc` join `en_rayon` `en_r`
       on ((`conc`.`en_rayon_id` = `en_r`.`id`))) join `produit` `pdt`
      on ((`pdt`.`id` = `en_r`.`produit_id`)));

create or replace definer = root@localhost view pharma_en_rayon_with_cmd_view as
select `en_r`.`prixAchat`        AS `prixAchat`,
       `en_r`.`prixVente`        AS `prixVente`,
       `en_r`.`dateLivraison`    AS `dateLivraison`,
       `en_r`.`datePeremption`   AS `datePeremption`,
       `en_r`.`quantite`         AS `quantite`,
       `en_r`.`quantiteRestante` AS `quantiteRestante`,
       `pd`.`nom`                AS `nom`,
       `cmd`.`ref`               AS `ref`
from ((`en_rayon` `en_r` join `produit` `pd`
       on ((`en_r`.`produit_id` = `pd`.`id`))) join `commande` `cmd`
      on ((`en_r`.`commande_id` = `cmd`.`id`)));

create or replace definer = root@localhost view pharma_en_rayon_without_cmd_view as
select `en_r`.`prixAchat`        AS `prixAchat`,
       `en_r`.`prixVente`        AS `prixVente`,
       `en_r`.`dateLivraison`    AS `dateLivraison`,
       `en_r`.`datePeremption`   AS `datePeremption`,
       `en_r`.`quantite`         AS `quantite`,
       `en_r`.`quantiteRestante` AS `quantiteRestante`,
       `pd`.`nom`                AS `nom`
from (`en_rayon` `en_r` join `produit` `pd` on ((`en_r`.`produit_id` = `pd`.`id`)));

create or replace definer = root@localhost view pharma_produit_cmd_view as
select `pd_cm`.`puCmd`    AS `puCmd`,
       `pd_cm`.`ptCmd`    AS `ptCmd`,
       `pd_cm`.`qtiteCmd` AS `qtiteCmd`,
       `pd_cm`.`etat`     AS `etat`,
       `pd`.`nom`         AS `nom`,
       `cmd`.`ref`        AS `ref`
from ((`produit_cmd` `pd_cm` join `produit` `pd`
       on ((`pd_cm`.`produit_id` = `pd`.`id`))) join `commande` `cmd`
      on ((`pd_cm`.`commande_id` = `cmd`.`id`)));

create or replace definer = root@localhost view pharma_produit_commande_view as
select `pdt`.`nom`           AS `nom`,
       `pdt`.`ean13`         AS `ean13`,
       `pdt_cmd`.`puCmd`     AS `puCmd`,
       `pdt_cmd`.`ptCmd`     AS `ptCmd`,
       `pdt_cmd`.`qtiteCmd`  AS `qtiteCmd`,
       `pdt_cmd`.`etat`      AS `etat`,
       `cmd`.`ref`           AS `ref`,
       `four`.`nom`          AS `fournisseurName`,
       `cmd`.`montantCmd`    AS `montantCmd`,
       `cmd`.`montantRecu`   AS `montantRecu`,
       `cmd`.`dateCreation`  AS `dateCreation`,
       `cmd`.`dateLivraison` AS `dateLivraison`
from (((`produit_cmd` `pdt_cmd` join `commande` `cmd`
        on ((`pdt_cmd`.`commande_id` = `cmd`.`id`))) join `produit` `pdt`
       on ((`pdt`.`id` = `pdt_cmd`.`produit_id`))) join `fournisseur` `four`
      on ((`four`.`id` = `cmd`.`fournisseur_id`)));

create or replace definer = root@localhost view pharma_produit_en_rayon_view as
select `pdt`.`id`                 AS `id`,
       `pdt`.`nom`                AS `nom`,
       `pdt`.`ean13`              AS `ean13`,
       `enray`.`prixVente`        AS `prixVente`,
       `enray`.`prixAchat`        AS `prixAchat`,
       `enray`.`quantiteRestante` AS `quantiteRestante`,
       `enray`.`reduction`        AS `reduction`,
       `enray`.`datePeremption`   AS `datePeremption`
from (`produit` `pdt` join `en_rayon` `enray` on ((`pdt`.`id` = `enray`.`produit_id`)))
where `enray`.`datePeremption` in (select max(`enray`.`datePeremption`))
group by `pdt`.`id`
order by `pdt`.`id`;

create or replace definer = root@localhost view pharma_produit_view as
select `pdt`.`id`    AS `id`,
       `pdt`.`nom`   AS `nom`,
       `pdt`.`ean13` AS `ean13`,
       `cat`.`nom`   AS `nom_categorie`,
       `fab`.`nom`   AS `nom_fabriquant`,
       `ray`.`nom`   AS `nom_rayon`,
       `form`.`nom`  AS `nom_formee`
from ((((`produit` `pdt` join `categorie` `cat`
         on ((`pdt`.`categorie_id` = `cat`.`id`))) join `fabriquant` `fab`
        on ((`fab`.`id` = `pdt`.`fabriquant_id`))) join `rayon` `ray`
       on ((`ray`.`id` = `pdt`.`rayon_id`))) join `forme` `form` on ((`form`.`id` = `pdt`.`forme_id`)));

create or replace definer = root@localhost view pharma_vente_view as
select `ven`.`id`           AS `venteId`,
       `ven`.`prixTotal`    AS `prixTotal`,
       `emp`.`identifiant`  AS `identifiant`,
       `ven`.`prixPercu`    AS `prixPercu`,
       `ven`.`reference`    AS `reference`,
       `ven`.`reduction`    AS `reduction`,
       `ven`.`nouveau_info` AS `nouveau_info`,
       `ven`.`commentaire`  AS `commentaire`,
       `ven`.`etat`         AS `etat`,
       `cai`.`session`      AS `session`,
       `cai`.`id`           AS `caisseId`,
       `cai`.`employe_id`   AS `caisseUserId`,
       `ven`.`dateVente`    AS `dateVente`
from ((`vente` `ven` join `employe` `emp`
       on ((`ven`.`employe_id` = `emp`.`id`))) join `caisse` `cai` on ((`ven`.`caisse_id` = `cai`.`id`)))
where (`ven`.`supprimer` = 0);

create or replace definer = root@localhost view wms_vente_view as
select `ven`.`id`          AS `venteId`,
       `ven`.`prixTotal`   AS `prixTotal`,
       `emp`.`identifiant` AS `identifiant`,
       `ven`.`prixPercu`   AS `prixPercu`,
       `ven`.`reference`   AS `reference`,
       `cai`.`session`     AS `session`,
       `ven`.`dateVente`   AS `dateVente`
from ((`vente` `ven` join `employe` `emp`
       on ((`ven`.`employe_id` = `emp`.`id`))) join `caisse` `cai` on ((`ven`.`caisse_id` = `cai`.`id`)));

alter table concerner
  add foreign key (vente_id) references vente (id),
  add foreign key (en_rayon_id) references en_rayon (id),
  add foreign key (produit_id) references produit (id);

alter table commande
  add foreign key (employe_id) references employe (id);

alter table vente
  add foreign key (employe_id) references employe (id);

alter table concerner
  add foreign key (produit_id) references produit (id),
  add foreign key (en_rayon_id) references en_rayon (id),
  add foreign key (vente_id) references vente (id);

alter table en_rayon
  add foreign key (produit_id) references produit (id),
  add foreign key (unite_id) references unite (id),
  add foreign key (rayon_id) references rayon (id),
  add foreign key (fournisseur_id) references fournisseur (id),
  add foreign key (commande_id) references commande (id);

alter table produit
  add foreign key (categorie_id) references categorie (id),
  add foreign key (fabriquant_id) references fabriquant (id),
  add foreign key (rayon_id) references rayon (id),
  add foreign key (magasin_id) references magasin (id),
  add foreign key (forme_id) references forme (id);

alter table sortie_stock
  add foreign key (en_rayon_id) references en_rayon (id),
  add foreign key (type_sortie_id) references type_sortie (id);

alter table transaction
  add foreign key (user_id) references user (id);

alter table code_postal
  add foreign key (Ville_id) references ville (id);

alter table malade
  add foreign key (code_postal_id) references code_postal (id);

alter table pharmacy
  add foreign key (code_postal_id) references code_postal (id);

alter table produit_inventaire
  add foreign key (inventaire_id) references inventaire (id),
  add foreign key (en_rayon_id) references en_rayon (id),
  add foreign key (employe_id) references employe (id);

alter table vente
  add foreign key (malade_id) references malade (id),
  add foreign key (user_id) references user (id),
  add foreign key (prescripteur_id) references prescripteur (id),
  add foreign key (caisse_id) references caisse (id);

alter table facturation
  add foreign key (vente_id) references vente (id),
  add foreign key (caisse_id) references caisse (id);

alter table produit_vendu
  add foreign key (vente_id) references vente (id),
  add foreign key (produit_id) references produit (id);

alter table retour_produit
  add foreign key (vente_id) references vente (id),
  add foreign key (employe_id) references employe (id),
  add foreign key (caisse_id) references caisse (id);

alter table produit_retour
  add foreign key (retour_produit_id) references retour_produit (id),
  add foreign key (concerner_id) references concerner (id);
