import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {EnrayonsService} from "@services/enrayons.service";
import {MatCardModule} from "@angular/material/card";
import { CommonModule, formatDate } from "@angular/common";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {ProductService} from "@services/products.service";
import {MatListModule} from "@angular/material/list";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {AuthService} from "@services/auth.service";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {LoaderService} from "@services/loader.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {AppService} from "@services/app.service";

@Component({
  selector: 'app-ajouter-commande-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    FlexLayoutModule,
    MatToolbarModule
  ],
  templateUrl: './ajouter-commande-dialog.component.html',
  styleUrl: './ajouter-commande-dialog.component.scss'
})
export class AjouterCommandeDialogComponent implements OnInit {

  commandeForm: FormGroup;
  products: any[] = [];
  fournisseurs: any[] = [];
  selectedProducts: FormArray;
  columns: string[] = ['nom', 'prixAchat', 'prixVente', 'quantite', 'total', 'actions'];

  codeFournisseur: string = "00";
  typeCommande: string = 'en_attente';
  fournisseurId: string = '';
  fournisseur: any = null;
  defaultDateDePeremption: string;

  total: number = 0

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<AjouterCommandeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    private appService: AppService,
    private productService: ProductService,
    private fournisseursService: FournisseursService,
    private commandesService: CommandesService) {
    this.selectedProducts = this.fb.array([]);
    const today = new Date();
    const twoMonthsLater = new Date(today.setMonth(today.getMonth() + 2));
    this.defaultDateDePeremption = twoMonthsLater.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  ngOnInit(): void {
    this.updateColumns();
    this.searchFournisseur();
    // console.log("this.typeCommande")
    // console.log(this.typeCommande)
    // console.log("this.fournisseurId")
    // console.log(this.fournisseurId)
  }

  /*  updateColumns(): void {
      if (this.typeCommande === 'livree' || this.typeCommande === 'en_cours') {
        this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'uniteGratuite','dateDePeremption', 'total', 'actions'];
      }
      if (this.typeCommande === 'en_cours') {
        this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'uniteGratuite', 'quantiteRecu', 'total', 'actions'];
      }
    }*/

  updateColumns(): void {
    this.columns = ['nom', 'prixAchat', 'prixVente', 'quantite', 'total', 'actions'];
    if (this.typeCommande === 'livree' || this.typeCommande === 'en_cours') {
      this.columns.splice(4, 0, 'uniteGratuite', 'dateDePeremption');
    }
    if (this.typeCommande === 'en_cours') {
      this.columns.splice(5, 0, 'quantiteRecu');
    }
  }

  public searchProducts(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;

    this.productService.searchProducts(searchTerm, 0, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.products = data.content;
       ;
      },
      error: (err) => {
        console.error('Error searching products:', err);
       ;
      }
    });
  }

  public searchFournisseur(): void {

    this.fournisseursService.getFournisseurs().subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.fournisseurs = data;
       ;
      },
      error: (err) => {
        console.error('Error searching products:', err);
       ;
      }
    });
  }

  addProduct(product: any): void {
    // console.log("fournisseur")
    // console.log(this.fournisseur)
    const productGroup = this.fb.group({
      id: [product.id],
      codebarre: [product.id + "" + this.fournisseur.code + "" + formatDate(new Date(), 'yyyyMMddHHmmss', 'en-US')],
      reductionMax: [product.reductionMax],
      ean13: [product.ean13],
      nom: [product.nom],
      stock: [product.stock],
      datePeremption: new Date(product.datePeremption),
      uniteGratuite: [product.uniteGratuite],
      prix: [product.prix],
      type: [product.type],
      prixAchat: [product.prixAchat, [Validators.required, Validators.min(0)]],
      prixVente: [product.prixVente, [Validators.required, Validators.min(0)]],
      quantite: [1, [Validators.required, Validators.min(1)]],
      quantiteRecu: [this.typeCommande === 'en_cours' ? 0 : null, [Validators.min(0)]],
      dateDePeremption: [this.typeCommande === 'livree' || this.typeCommande === 'en_cours' ? new Date(product.datePeremption) : null]
    });
    // console.log("productGroup");
    // console.log(productGroup);
    this.selectedProducts.push(productGroup);
    this.updateTotal()
  }

  removeProduct(index: number): void {
    this.selectedProducts.removeAt(index);
    this.updateTotal()
  }

  createCommande(): void {
    if (this.canCreateCommande) {
      const payload = {
        clientId: 0,
        employeId: 1,
        fournisseurId: this.fournisseur.id,
        produits: this.selectedProducts.value.map((product: any) => ({
          id: product.id,
          codebarre: product.codebarre,
          nom: product.nom || "",
          quantite: product.quantite ?? 0,
          uniteGratuite: product.uniteGratuite ?? 0,
          quantiteRecu: product.quantiteRecu ?? 0,
          prixAchat: product.prixAchat,
          prixVente: product.prixVente,
          // dateDePeremption: product.dateDePeremption
          //   ? new Date(product.dateDePeremption).toISOString().replace('T', ' ').split('.')[0]
          //   : new Date().toISOString().replace('T', ' ').split('.')[0],
          dateDePeremption: product.dateDePeremption
            ? this.appService.formatDate(new Date(product.dateDePeremption)+"")
            : this.appService.formatDate(new Date()+"")
        })),
        type: this.typeCommande
      };

      this.commandesService.addCommande(payload).subscribe({
        next: (response) => {
          this.dialogRef.close();
          this.snackBar.open('Commande created', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });

        },
        error: (err) => {
          this.snackBar.open(`Error creating commande.`, '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });

        }
      });
    }
  }

  increment(item: any, field: 'quantite' | 'quantiteRecu' | 'prixVente' | 'prixAchat' | 'uniteGratuite') {
    item[field]++;
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
    this.updateTotal()
  }

  decrement(item: any, field: 'quantite' | 'quantiteRecu' | 'prixVente' | 'prixAchat' | 'uniteGratuite') {
    if (item[field] > 0) {
      item[field]--;
    }
    this.updateTotal()
    // this.selectedProducts.value = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  get canCreateCommande(): boolean {
    // console.log("canCreateCommande")
    // console.log(this.typeCommande)
    // console.log(this.fournisseurId)
    // console.log(this.selectedProducts.value.length)
    return this.typeCommande.trim() !== '' &&
      this.fournisseur != null &&
      this.selectedProducts.value.length > 0;
  }

  generatePDF(product: any):Promise<void> {
    // console.log("generatePDF")
    // console.log(product)
    // console.log(this.fournisseurId)
    // console.log(this.codeFournisseur)
    return new Promise((resolve) => {

      const qte = product.quantite + product.uniteGratuite;
      const base64Image = product.codebarre;


      const doc = new jsPDF({orientation: 'landscape', unit: 'mm', format: [30, 20]});

      // Precompute reusable values
      const today = new Date();
      const todayFormatted = today.toLocaleDateString('en-GB').replace(/\//g, '-');
      const todayCode = todayFormatted.replace(/-/g, '');

      const qrCodePromises = Array.from({length: qte}, async (_, index) => {
        const code = `${product.codebarre}`;
        return QRCode.toDataURL(code);
      });

      Promise.all(qrCodePromises).then((qrCodes) => {
        qrCodes.forEach((qrCodeDataUrl, index) => {
          // Add content to the PDF
          doc.cell(0, 0, 30, 20, ' ', 0, 'center');
          doc.addImage(qrCodeDataUrl, 'JPEG', -2, -2, 22, 22);
          doc.setFontSize(7).text(`${product.prixVente || ''} F`, 19, 6);
          doc.setFontSize(5).text(`${this.fournisseur.code || ''}`, 19, 8);
          doc.setFontSize(4)
            .text(new Date(product.datePeremption || '').toLocaleString('fr-FR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              // hour: '2-digit',
              // minute: '2-digit'
            }).replaceAll('/', '-'), 19, 10)
            .text(todayFormatted, 19, 12);
          doc.text(product.nom || '', 1, 19);

          // Add a new page unless it's the last iteration
          if (index < qte - 1) doc.addPage([30, 20], 'l');
        });

        // this.isLoading = false;
        doc.save(`${product.nom || 'Document'}.pdf`);
        resolve();
      });
    });
  }

  updateTotal() {
    this.total = 0
    this.selectedProducts.value.forEach((product: any) => {
      this.total = this.total + (product.quantite * product.prixAchat)
    })
  }
}
