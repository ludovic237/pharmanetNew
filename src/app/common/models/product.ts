export class Product {
    constructor(public id: number,
                public name: string,
                public images: Array<any>,
                public oldPrice: number,
                public newPrice: number,
                public discount: number,
                public ratingsCount: number,
                public ratingsValue: number,
                public description: string,
                public availibilityCount: number,
                public cartCount: number,
                public color: Array<string>,
                public size: Array<string>,
                public weight: number,
                public categoryId: number){ }
}

export interface ProductNew {
  categorieNom: string;
  codebarre: string;
  dateCreation: string;
  dateModification: string;
  description: string;
  id: number;
  image: string;
  margeBeneficiaire: number;
  nom: string;
  prixAchatInitial: number;
  prixVenteActuel: number;
  prixVenteConseille: number;
  quantiteTotaleEnStock: number;
  seuil: number;
  stockDetails:  any[]
  tva: number;
  uniteMesure: string;
}

export interface Categorie {
  id?: number; // Optional for creation
  nom: string;
}

export interface Forme {
  id?: number; // Optional for creation
  nom: string;
}

export interface Fabriquant {
  id?: number; // Optional for creation
  nom: string;
  adresse?: string; // Optional
  telephone?: string; // Optional
  email?: string; // Optional
}

export interface Rayon {
  id?: number; // Optional for creation
  nom: string;
  code: string;
}

export interface Magasin {
  id?: number; // Optional for creation
  nom: string;
  adresse?: string; // Optional
}

