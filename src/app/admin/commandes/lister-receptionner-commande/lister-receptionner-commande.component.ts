import {Component, OnInit, ViewChild} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {VentesService} from "@services/ventes.service";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {CommonModule} from "@angular/common";
import {MatListModule, MatListOption, MatSelectionList} from "@angular/material/list";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatDividerModule} from "@angular/material/divider";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {Settings, SettingsService} from "@services/settings.service";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDialog} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {TicketCaisseService} from "@services/tickets.service";
import {BonCaisseService} from "@services/boncaisses.service";
import {BonCaisseDialogComponent} from "./bon-caisse-dialog/bon-caisse-dialog.component";
import {DepenseService} from "@services/depenses.service";
import {DepenseDialogComponent} from "./depense-dialog/depense-dialog.component";
import {VenteDialogComponent} from "./vente-dialog/vente-dialog.component";
import {MatStepper, MatStepperModule} from "@angular/material/stepper";

interface Commande {
  id: string;
  reference: string;
  fournisseur: string;
  dateCommande: Date;
  lignes: LigneCommande[];
}

interface LigneCommande {
  produitId: string;
  nom: string;
  quantiteCommandee: number;
  quantiteRecue?: number;
  quantiteDefectueuse?: number;
}

@Component({
  selector: 'app-lister-receptionner-commande',
  imports: [
    MatRadioModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './lister-receptionner-commande.component.html',
  styleUrl: './lister-receptionner-commande.component.scss'
})


export class ListerReceptionnerCommandeComponent {

  @ViewChild('stepper') stepper!: MatStepper;

  // Étape 1 : commandes à réceptionner
  commandes: Commande[] = [];
  displayedColsCmd = ['select', 'reference', 'fournisseur', 'dateCommande'];
  selection = new Set<string>();

  // Formulaire global
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      lignes: this.fb.array([]),
      dateReception: [new Date(), Validators.required]
    });
  }

  ngOnInit() {
    this.commandes = this.mockLoadCommandes();
  }

  mockLoadCommandes(): Commande[] {
    return [
      {
        id: 'C100',
        reference: 'CMD-100',
        fournisseur: 'ACME SARL',
        dateCommande: new Date('2025-06-10'),
        lignes: [
          {produitId: 'P1', nom: 'Vis 4×20', quantiteCommandee: 100},
          {produitId: 'P2', nom: 'Écrou M6', quantiteCommandee: 100}
        ]
      },
      {
        id: 'C101',
        reference: 'CMD-101',
        fournisseur: 'FournisPlus',
        dateCommande: new Date('2025-06-12'),
        lignes: [
          {produitId: 'P3', nom: 'Rondelle Ø8', quantiteCommandee: 200}
        ]
      }
    ];
  }

  /***** Étape 1 *****/
  toggleSelection(cmd: Commande) {
    this.selection.has(cmd.id) ? this.selection.delete(cmd.id) : this.selection.add(cmd.id);
  }

  nextStep() {
    if (this.selection.size === 0) {
      this.snack.open('Sélectionnez au moins une commande.', 'OK', {duration: 2000});
      return;
    }
    this.buildReceptionForm();
    this.stepper.next();
  }

  /***** Étape 2 *****/
  get lignesFA(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  buildReceptionForm() {
    this.lignesFA.clear();
    this.commandes
      .filter(c => this.selection.has(c.id))
      .forEach(c => {
        c.lignes.forEach(l => {
          this.lignesFA.push(this.fb.group({
            produitId: [l.produitId],
            nom: [l.nom],
            quantiteCommandee: [l.quantiteCommandee],
            quantiteRecue: [l.quantiteRecue ?? 0, [Validators.required, Validators.min(0), Validators.max(l.quantiteCommandee)]],
            quantiteDefectueuse: [l.quantiteDefectueuse ?? 0, [Validators.required, Validators.min(0), Validators.max(l.quantiteCommandee)]]
          }));
        });
      });
  }

  /***** Étape 3 *****/
  onSubmit() {
    if (this.form.invalid) return;
    const payload = {
      commandes: Array.from(this.selection),
      dateReception: this.form.value.dateReception,
      lignes: this.form.value.lignes
    };
    console.log('Envoi reception:', payload);
    // TODO : appel API…

    this.snack.open('Réception enregistrée avec succès', 'OK', {duration: 2000});
    this.stepper.reset();
    this.selection.clear();
    this.lignesFA.clear();
  }
}
