import {Component, Input, OnInit} from '@angular/core';
import {map, Observable} from "rxjs";
import {AiService} from "@services/ai.service";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatBadgeModule} from "@angular/material/badge";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@services/auth.service";

type ViewItem = any & { rank: number; percent: number };


@Component({
  selector: 'app-associated-products',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBar,
    MatBadgeModule
  ],
  templateUrl: './associated-products.component.html',
  styleUrl: './associated-products.component.scss'
})
export class AssociatedProductsComponent implements OnInit {
  @Input() productId?: number | null = 1002;
  @Input() top?: number | null = 20;
  @Input() limitBaskets = 5000;

  loading = true;
  error?: string;
  items$!: Observable<ViewItem[]>;
  items: any[]=[];
  ctxTitle = 'Produits associés';
  subtitle = 'Achats fréquents ensemble';

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar,
    private ai: AiService) {}

  ngOnInit(): void {
    // this.items$ = this.ai.recommendations(this.productId ?? undefined, this.limitBaskets).pipe(
    // this.items$ = this.ai.recommendations(this.productId).pipe(
    //   map(res => (res.recommendations || [])
    //     .sort((a,b) => b.score - a.score)
    //     .map((r, idx) => ({
    //       ...r,
    //       rank: idx + 1,
    //       percent: Math.round((r.score ?? 0) * 100)
    //     }))
    //   )
    // );
    // // flag de chargement simple
    // this.items$.subscribe({
    //   next: () => (this.loading = false),
    //   error: (e) => { this.loading = false; this.error = e?.message || 'Erreur de chargement'; }
    // });
    this.getRecommendations();
  }

  trackById = (_: number, it: ViewItem) => it.produit_id;

  public getRecommendations() {

    this.ai.recommendations(this.productId, this.top, this.limitBaskets).subscribe({
      next: (data: any) => {
        console.log("getRecommendations")
        console.log(data)
        this.items$ = data.recommendations
        this.items = data.recommendations
      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });
  }
}
