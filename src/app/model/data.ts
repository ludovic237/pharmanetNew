export class User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'locataire' | 'visiteur';
  motDePasse: string;
}

export class UserNew {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  birthday: Object;
  gender: string;
  image: string;
  isActive: boolean;
  isDeleted: boolean;
  registrationDate: Date;
  joinedDate: Date;
  username: string;
}

export class Tenant {
  id: number;
  userId: number;
  moveInDate: Date;
  moveOutDate: Date;
  housingUnitId: number;
  securityDeposit: number;
}

export class HoustingUnit {
  id: number;
  number: string;
  floor: number;
  area: number;
  address: string;
  type: 'studio' | 'T2' | 'T3' | 'T4';
}

export class Rent {
  id: number;
  housingUnitId: number;
  tenantId: number;
  mois: number;
  annee: number;
  montant: number;
  status: 'payé' | 'non payé' | 'en retard';
  datePaiement?: Date;
}

export class Invoice {
  id: number;
  tenantId: number;
  type: 'eau' | 'électricité' | 'gaz' | 'autre';
  mois: number;
  montant: number;
  status: 'payée' | 'impayée';
  datePaiement?: Date;
}

export class Issue {
  id: number;
  tenantId: number;
  titre: string;
  description: string;
  dateDeclaration: Date;
  status: 'ouvert' | 'en cours' | 'résolu';
}

export class Service {
  id: number;
  nom: string;
  description: string;
  prixMensuel: number;
}

export class Subscription {
  id: number;
  tenantId?: number;
  utilisateurId?: number;
  serviceId: number;
  dateDebut: Date;
  dateFin?: Date;
  status: string;
}
