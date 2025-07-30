export type commandeDtao = commandeDtaoChild[];
export class commandeDtaoChild {
	private id: number;
	private nom: string;
	private prix: number;
	private stock: number;
	private fournisseur: string;
	private dateLivraison: string;
	private datePeremption: string;
	private quantiteStock: number;
	private prixAchat: number;
	private quantiteRestante: number;
	public setId (id: number) {
		this.id = id;
	}
	public getId () {
		return this.id;
	}
	public setNom (nom: string) {
		this.nom = nom;
	}
	public getNom () {
		return this.nom;
	}
	public setPrix (prix: number) {
		this.prix = prix;
	}
	public getPrix () {
		return this.prix;
	}
	public setStock (stock: number) {
		this.stock = stock;
	}
	public getStock () {
		return this.stock;
	}
	public setFournisseur (fournisseur: string) {
		this.fournisseur = fournisseur;
	}
	public getFournisseur () {
		return this.fournisseur;
	}
	public setDateLivraison (dateLivraison: string) {
		this.dateLivraison = dateLivraison;
	}
	public getDateLivraison () {
		return this.dateLivraison;
	}
	public setDatePeremption (datePeremption: string) {
		this.datePeremption = datePeremption;
	}
	public getDatePeremption () {
		return this.datePeremption;
	}
	public setQuantiteStock (quantiteStock: number) {
		this.quantiteStock = quantiteStock;
	}
	public getQuantiteStock () {
		return this.quantiteStock;
	}
	public setPrixAchat (prixAchat: number) {
		this.prixAchat = prixAchat;
	}
	public getPrixAchat () {
		return this.prixAchat;
	}
	public setQuantiteRestante (quantiteRestante: number) {
		this.quantiteRestante = quantiteRestante;
	}
	public getQuantiteRestante () {
		return this.quantiteRestante;
	}
}