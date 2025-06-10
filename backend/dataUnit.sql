

-- Listage des données de la table pharmanet1.forme : ~28 rows (environ)
INSERT INTO `forme` (`id`, `code`, `nom`, `supprimer`) VALUES
	(2, 'FOR002', 'Plaquette', 0),
	(4, 'FOR001', 'Ampoule', 0),
	(5, 'FOR003', 'Sirop', 0),
	(6, 'FOR004', 'Ovule', 0),
	(7, 'FOR005', 'Injectable', 0),
	(8, 'FOR006', 'Comprimé', 0),
	(9, 'FOR006', 'Pommade', 0),
	(10, 'FOR007', 'Crème', 0),
	(11, 'FOR008', 'Gel', 0),
	(12, 'FOR009', 'flacon', 0),
	(13, 'FOR010', 'suppo', 0),
	(14, 'FOR011', 'Poudre', 0),
	(15, 'FOR012', 'Solution', 0),
	(16, 'FOR013', 'Comprimé', 0),
	(17, 'FOR014', 'Sachet', 0),
	(18, 'FOR015', 'PAQUET', 0),
	(19, 'FOR016', 'savon', 0),
	(20, 'FOR017', 'lait', 0),
	(21, 'FOR018', 'lotion', 0),
	(23, 'FOR019', 'Goutte', 0),
	(24, 'FOR020', 'huile', 0),
	(25, 'FOR021', 'appareil', 0),
	(26, 'FOR022', 'parfum', 0),
	(27, 'FOR200', 'TUBE', 0),
	(28, 'FOR 201', 'BAUME', 0),
	(29, 'FOR 202', 'LINGETTES', 0),
	(30, 'FOR 203', 'SERUM', 0),
	(31, 'FOR 204', 'POUDRE', 0);

-- Listage des données de la table pharmanet1.fournisseur : ~12 rows (environ)
INSERT INTO `fournisseur` (`id`, `code`, `nom`, `statut`, `codepostal`, `adresse`, `telephone`, `email`, `supprimer`) VALUES
	(1, '01', 'BIOPHARMA', 'Grossiste', '1', '', '', '', 0),
	(3, '02', 'RMS', 'Grossiste', '5', 'DOUALA AKWA FACE FOKOU DOUCHE', '233427486', 'referencemedico2011@gmail.com', 0),
	(4, '03', 'FOOT COSMETIQUE', 'Grossiste', '5', 'bafoussam', '------', 'fsds@fsef.fr', 0),
	(5, '04', 'laborex', 'Grossiste', '5', '(+237)242005268', '(+237) 242005268', 'laborex@yahoo.fr', 0),
	(6, '05', 'UBIPHAR; CM', 'Grossiste', '6', 'DLA', '233333333', 'ubi@ubi.cm', 0),
	(7, '06', 'REFERENCE', 'Detaillant', '1', 'FOUMBOT', '222222222', 'REF@REF.CM', 0),
	(8, '07', 'APOLLINAIRE', 'Detaillant', '6', 'test', '233333332', 'REF@REF.CM', 0),
	(9, '08', 'BIO-STRATH', 'Detaillant', '6', 'FOUMBOT', '222222222', 'REF@REF.CM', 0),
	(10, '09', 'DIVERS', 'Detaillant', '6', 'FOUMBOT', '222222222', 'REF@REF.CM', 0),
	(11, '10', 'COMMADE DIRECT', 'Detaillant', '6', 'FOUMBOT', '233333333', 'REF@REF.CM', 0),
	(12, '11', 'test', '', NULL, 'test', NULL, '', 1),
	(13, '12', 'INIT00', 'Grossiste', '', 'qwewe', '32323', '', 0);

-- Listage des données de la table pharmanet1.magasin : ~3 rows (environ)
INSERT INTO `magasin` (`id`, `code`, `nom`, `supprimer`) VALUES
	(1, 'MAG001', 'Magasin124', 0),
	(2, 'MAG002', 'Magasin12', 0),
	(6, 'MAG001', 'MAG001', 0);

-- Listage des données de la table pharmanet1.rayon : ~2 rows (environ)
INSERT INTO `rayon` (`id`, `code`, `nom`, `supprimer`) VALUES
	(1, 'RAY001', 'RAYON1', 0),
	(2, 'RAY002', 'FRIGO', 0);

-- Listage des données de la table pharmanet1.unite : ~10 rows (environ)
INSERT INTO `unite` (`id`, `nom`, `libelle`, `supprimer`) VALUES
	(1, 'Kg', 'Kilogramme', 0),
	(2, 'G', 'Gramme', 0),
	(3, 'DG', 'DG', 0),
	(6, 'MG', 'MG', 0),
	(7, 'L', 'L', 0),
	(8, 'DL', 'DL', 0),
	(9, 'CL', 'CL', 0),
	(10, 'ML', 'ML', 0),
	(11, NULL, NULL, 0),
	(12, 'CL', 'CL', 0);

-- Listage des données de la table pharmanet1.ville : ~4 rows (environ)
INSERT INTO `ville` (`id`, `nom`, `code`, `supprimer`) VALUES
	(1, 'BANGANGTE', 'VIL001', 0),
	(2, 'Bafoussam', 'VIL002', 0),
	(3, 'Yaoundé', 'v001', 0),
	(4, 'FOUMBOT', 'vil003', 0);

