import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule, DecimalPipe} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTableModule} from "@angular/material/table";
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../../theme/pipes/pipes.module";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-produit-rayon-info-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    RouterModule,
    FlexLayoutModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    NgxPaginationModule,
    PipesModule,
    DecimalPipe
  ],
  templateUrl: './produit-rayon-info-dialog.component.html',
  styleUrl: './produit-rayon-info-dialog.component.scss'
})
export class ProduitRayonInfoDialogComponent {

  etiquetteForm: FormGroup; // Form for creating bon

  etiquetteNomP!: string;
  etiquetteNomF!: string;
  etiquetteCode!: string;
  etiquetteDatel!: string;
  etiquetteDatep!: string;
  etiquettePrix!: string;
  etiquetteQte!: number;

  productForm: FormGroup;
  quantiteEtiquette: number = 1;

   constructor(
    public authService: AuthService,
    public snackBar:MatSnackBar,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProduitRayonInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.etiquetteForm = this.fb.group({
      quantiteEtiquette: [0, [Validators.required, Validators.min(1)]]
    })
    this.productForm = this.fb.group({
      nomProduit: [data?.data.nom || 'FLUIDTEC 750MG 10ML SACH 15', Validators.required],
      codeBarre: [data?.data.codeBarre || '200084202303081', Validators.required],
      nomFournisseur: [data?.data.nomFournisseur || 'laborex', Validators.required],
      codeFournisseur: [data?.data.codeFournisseur || '04', Validators.required],
      dateLivraison: [data?.data.dateLivraison || '2023-03-08'],
      datePeremption: [data?.data.datePeremption || '2024-05-01'],
      prixVente: [data?.data.prixVente || 2950, [Validators.required, Validators.min(0)]],
      quantite: [data?.data.quantite || 15, [Validators.required, Validators.min(1)]],
      quantiteRestante: [data?.data.quantiteRestante || 1, [Validators.required, Validators.min(0)]],
      prixAchat: [data?.data.prixAchat || 2207, [Validators.required, Validators.min(0)]],
      reduction: [data?.data.reduction || 10, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }

  onPrint() {

  }

  isLoading = false;

  generatePDF(): Promise<void> {
    return new Promise((resolve) => {
      const {data: etiquetteData} = this.data;
      console.log("this.quantiteEtiquette")
      console.log(this.etiquetteForm.get('quantiteEtiquette')?.value)
      const qte = this.etiquetteForm.get('quantiteEtiquette')?.value || 1;
      const base64Image = etiquetteData.codeBarre || 'https://example.com/default-image.jpg';
      this.isLoading = true;

      const doc = new jsPDF({orientation: 'landscape', unit: 'mm', format: [30, 20]});

      // Precompute reusable values
      const today = new Date();
      const todayFormatted = today.toLocaleDateString('en-GB').replace(/\//g, '-');
      const todayCode = todayFormatted.replace(/-/g, '');

      const qrCodePromises = Array.from({length: qte}, async (_, index) => {
        const code = `${etiquetteData.id}${etiquetteData.codeFournisseur || ''}${todayCode}`;
        return QRCode.toDataURL(code);
      });

      Promise.all(qrCodePromises).then((qrCodes) => {
        qrCodes.forEach((qrCodeDataUrl, index) => {
          // Add content to the PDF
          doc.cell(0, 0, 30, 20, ' ', 0, 'center');
          doc.addImage(qrCodeDataUrl, 'JPEG', -2, -2, 22, 22);
          doc.setFontSize(7).text(`${etiquetteData.prixVente || ''} F`, 19, 6);
          doc.setFontSize(5).text(`${etiquetteData.codeFournisseur || ''}`, 19, 8);
          doc.setFontSize(4)
            .text(new Date(etiquetteData.datePeremption || '').toLocaleString('fr-FR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              // hour: '2-digit',
              // minute: '2-digit'
            }).replaceAll('/', '-'), 19, 10)
            .text(todayFormatted, 19, 12);
          doc.text(etiquetteData.nom || '', 1, 19);

          // Add a new page unless it's the last iteration
          if (index < qte - 1) doc.addPage([30, 20], 'l');
        });

        this.isLoading = false;
        doc.save(`${etiquetteData.nom || 'Document'}.pdf`);
        resolve();
      });
    });
  }

  async addPageContent(doc: jsPDF, base64Image: string, product: any): Promise<void> {

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayFormatted = `${dd}-${mm}-${yyyy}`;
    const todayCode = `${dd}${mm}${yyyy}`;


    const nom = product.nom || '';
    const datelivraison = product.dateLivraison || '';
    const dateperemption = product.datePeremption || '';

    const prix = product.prixVente || '';
    const codefournisseur = product.codeFournisseur || '';

    // this.etiquetteQte = qte + ug;
    this.etiquetteNomP = nom;
    this.etiquetteNomF = codefournisseur;
    this.etiquetteCode = `${product.id}${codefournisseur}${todayCode}`;
    this.etiquetteDatel = todayFormatted;
    this.etiquetteDatep = dateperemption;
    // this.etiquetteDatep = datelivraison;
    this.etiquettePrix = prix;

    console.log("etiquetteData")
    console.log(this.etiquetteNomP)
    console.log(this.etiquetteNomF)
    console.log(this.etiquetteCode)
    console.log(this.etiquetteDatel)
    console.log(this.etiquetteDatep)
    console.log(this.etiquettePrix)

    const qrCodeDataUrl = await QRCode.toDataURL(this.etiquetteCode);
    doc.cell(0, 0, 30, 20, ' ', 1, "center");
    doc.setFontSize(7);
    doc.text(`${this.etiquettePrix} F`, 19, 6,);
    doc.addImage(qrCodeDataUrl, "JPEG", 1, 1, 16, 16);
    doc.setFontSize(5);
    doc.text(`${this.etiquetteNomF}`, 19, 8,);
    doc.setFontSize(4);
    doc.text(this.etiquetteDatep.toString(), 19, 10);
    doc.text(this.etiquetteDatel.toString(), 19, 12);
    doc.text(this.etiquetteNomP, 1, 19,);
  }


}
