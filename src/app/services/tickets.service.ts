import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TicketCaisse {
  id?: number;
  codebarre?: number;
  montant?: number;
  dateGenere?: string;
  statut?: string;
  validite?: number;
  supprimer?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TicketCaisseService {
  private url = 'api/admin/tickets';

   constructor(
   private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllTickets(): Observable<TicketCaisse[]> {
    return this.http.get<TicketCaisse[]>(this.url, { headers: this.getHeaders() });
  }

  getTicketById(id: number): Observable<TicketCaisse> {
    return this.http.get<TicketCaisse>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }

  getTicketByCodebarre(codebarre: number): Observable<TicketCaisse> {
    return this.http.get<TicketCaisse>(`${this.url}/codebarre/${codebarre}`, { headers: this.getHeaders() });
  }

  createTicket(ticket: TicketCaisse): Observable<TicketCaisse> {
    return this.http.post<TicketCaisse>(this.url, ticket, { headers: this.getHeaders() });
  }

  updateTicket(id: number, ticket: TicketCaisse): Observable<TicketCaisse> {
    return this.http.put<TicketCaisse>(`${this.url}/${id}`, ticket, { headers: this.getHeaders() });
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}
