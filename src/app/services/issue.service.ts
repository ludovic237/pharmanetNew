import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, of } from 'rxjs';
    import { Issue } from '../model/data';

    @Injectable({
      providedIn: 'root'
    })
    export class IssueService {
      private apiUrl = '/api/issues';

      private token = localStorage.getItem('token');

      constructor(private http: HttpClient) {}

      getIssues(): Observable<Issue[]> {
        // return this.http.get<Issue[]>(this.apiUrl);
        const mockData: Issue[] = [
          // {
          //   id: 1,
          //   tenantId: 101,
          //   titre: 'Plumbing Issue',
          //   price: 'Leaking pipe in the kitchen',
          //   dateDeclaration: new Date('2023-01-10'),
          //   status: 'ouvert'
          // },
          // {
          //   id: 2,
          //   tenantId: 102,
          //   titre: 'Electrical Issue',
          //   price: 'Power outage in the living room',
          //   dateDeclaration: new Date('2023-02-05'),
          //   status: 'en cours'
          // }
        ];
        return of(mockData);
      }

      getIssueById(id: number): Observable<Issue> {
        // return this.http.get<Issue>(`${this.apiUrl}/${id}`);
        const mockData: Issue = {
          id,
          tenantId: 101,
          titre: 'Plumbing Issue',
          price: 'Leaking pipe in the kitchen',
          dateDeclaration: new Date('2023-01-10'),
          status: 'ouvert'
        };
        return of(mockData);
      }

      createIssue(issue: Issue): Observable<Issue> {
        // return this.http.post<Issue>(this.apiUrl, issue);
        const mockData: Issue = { ...issue, id: Math.floor(Math.random() * 1000) };
        return of(mockData);
      }

      updateIssue(id: number, issue: Issue): Observable<Issue> {
        // return this.http.put<Issue>(`${this.apiUrl}/${id}`, issue);
        const mockData: Issue = { ...issue, id };
        return of(mockData);
      }

      deleteIssue(id: number): Observable<void> {
        // return this.http.delete<void>(`${this.apiUrl}/${id}`);
        return of(undefined);
      }
    }
