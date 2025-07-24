import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Page} from "ngx-pagination";

@Injectable({
  providedIn: 'root'
})
export class CommandesService {
  private url = 'api/commandes';

   constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCommandes(): Observable<any[]> {
    return this.http.get<any[]>(this.url, {headers: this.getHeaders()});
  }

  fetchCommandesPageable(page: number, size: number,
                         selectedEtats: string,
                         selectedFournisseur: string,
                         startDate: string,
                         endDate: string): Observable<Page> {
    return this.http.get<Page>(this.url + `/paged?page=${page}&etat=${selectedEtats}&fournisseurId=${selectedFournisseur}&startDate=${startDate}&endDate=${endDate}&size=${size}`, {headers: this.getHeaders()});
  }

  getCommandeInfo(commandeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${commandeId}`, {headers: this.getHeaders()});
  }


  addCommande(commande: any): Observable<any> {
    return this.http.post<any>(this.url, commande, {headers: this.getHeaders()});
  }

  updateCommande(id: number, commande: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, commande, {headers: this.getHeaders()});
  }

  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, {headers: this.getHeaders()});
  }

  envoyerReception(typeReception: string, data: any): void {
    switch (typeReception) {
      case 'enRayon':
        this.http.post('http://localhost:8080/api/en-rayon/par-produit', data).subscribe({
          next: (response) => {
            console.log('Réception en rayon réussie:', response);
          },
          error: (err) => {
            console.error('Erreur lors de la réception en rayon:', err);
          }
        });
        break;

      case 'venteSansEncaissement':
        this.http.post('http://localhost:8080/api/ventes/creer-sans-encaissement', data).subscribe({
          next: (response) => {
            console.log('Vente sans encaissement réussie:', response);
          },
          error: (err) => {
            console.error('Erreur lors de la création de la vente sans encaissement:', err);
          }
        });
        break;

      case 'commande':
        this.http.post('http://localhost:8080/api/commandes', data).subscribe({
          next: (response) => {
            console.log('Commande créée avec succès:', response);
          },
          error: (err) => {
            console.error('Erreur lors de la création de la commande:', err);
          }
        });
        break;

      default:
        console.error('Type de réception non pris en charge:', typeReception);
    }
  }

  receptionComplete(commandeId: number, typeReception: string, productCmdList: any[]) {
    return this.http.post<any>(`${this.url}/${commandeId}/reception?receptionType=` + typeReception,
      productCmdList,
      {headers: this.getHeaders()});
  }

  modifierLignes(commandeId: number, produits: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/modifier-lignes`, produits, {headers: this.getHeaders()});
  }

  supprimerCommande(commandeId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${commandeId}`, {headers: this.getHeaders()});
  }

  ajouterFournisseur(commandeId: number, fournisseurId: number): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/ajouter-fournisseur?fournisseurId=${fournisseurId}`, null, {headers: this.getHeaders()});
  }

  annulerCommande(commandeId: number): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/annuler`, null, {headers: this.getHeaders()});
  }

  imprimerBonPdf(commandeId: number): Observable<Blob> {
    return this.http.post(`${this.url}/${commandeId}/imprimer-bon-pdf`, null, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  receptionComplementaire(commandeId: number, produits: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/reception-complementaire`, produits, {headers: this.getHeaders()});
  }

  ajouterJustificatif(commandeId: number, justificatif: string): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/ajouter-justificatif?justificatif=${justificatif}`, null, {headers: this.getHeaders()});
  }

  visualiserHistoriqueReception(commandeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${commandeId}/historique-reception`, {headers: this.getHeaders()});
  }

  cloturerCommande(commandeId: number): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/cloturer`, null, {headers: this.getHeaders()});
  }

  ajouterFacture(commandeId: number, facture: string): Observable<any> {
    return this.http.post<any>(`${this.url}/${commandeId}/ajouter-facture?facture=${facture}`, null, {headers: this.getHeaders()});
  }

  genererRapportLivraison(commandeId: number): Observable<string> {
    return this.http.post<string>(`${this.url}/${commandeId}/generer-rapport`, null, {headers: this.getHeaders()});
  }

  exporterCommande(commandeId: number): Observable<string> {
    return this.http.get<string>(`${this.url}/${commandeId}/exporter`, {headers: this.getHeaders()});
  }

  lireDetails(commandeId: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${commandeId}`, {headers: this.getHeaders()});
  }

  ajouterMotifAnnulation(commandeId: number, motif: string): Observable<void> {
    return this.http.post<void>(`${this.url}/${commandeId}/ajouter-motif-annulation?motif=${motif}`, null, {headers: this.getHeaders()});
  }


}
