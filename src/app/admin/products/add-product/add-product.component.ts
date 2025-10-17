import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute} from '@angular/router';
import {Category} from '@models/category';
import {AppService} from '@services/app.service';
import {InputFileModule} from '../../../theme/components/input-file/input-file.module';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {CategorieService} from "@services/categories.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";

import {ProductService} from "@services/products.service";
import {EtageresService} from "@services/etageres.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {LoaderService} from "@services/loader.service";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-add-product',
  imports: [
    FormsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatCardModule,
    InputFileModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    TranslateModule
],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit {
  public form: FormGroup;
  public colors = ["#5C6BC0", "#66BB6A", "#EF5350", "#BA68C8", "#FF4081", "#9575CD", "#90CAF9", "#B2DFDB", "#DCE775", "#FFD740", "#00E676", "#FBC02D", "#FF7043", "#F5F5F5", "#696969"];
  public sizes = ["S", "M", "L", "XL", "2XL", "32", "36", "38", "46", "52", "13.3\"", "15.4\"", "17\"", "21\"", "23.4\""];
  public selectedColors: string;
  public categories: any[];
  public rayons: any[];
  public magasins: any[];
  public formes: any[];
  public fabriquants: any[];
  public etagere: any[];
  private sub: any;
  public id: any;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
    public categorieService: CategorieService,
    public etageresService: EtageresService,
    public magasinService: MagasinService,
    public rayonService: RayonService,
    public fabriquantService: FabriquantService,
    public formeService: FormeService,
    public productService: ProductService,
    public appService: AppService,
    public formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nom: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      ean13: [null, Validators.maxLength(16)],
      codeLaborex: [null, Validators.maxLength(32)],
      codeUbipharm: [null, Validators.maxLength(32)],
      reference: [null, Validators.maxLength(32)],
      stock: [null, Validators.min(0)],
      stockMax: [null, Validators.min(0)],
      stockMin: [null, Validators.min(0)],
      contenuDetail: [null],
      prixDetail: [null],
      etat: [null],
      reductionMax: [null, Validators.min(0)],
      grossisteId: [null],
      detailId: [null],
      categorieId: [null, Validators.required],
      formeId: [null],
      fabriquantId: [null],
      rayonId: [null],
      etagere: [null, Validators.maxLength(15)],
      magasinId: [null]
    });

    this.getCategories();
    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
        this.getProductById();
      }
    });
    this.getCategories();
    this.getRayon();
    this.getEtagere();
    this.getMagasin();
    this.getForme();
    this.getFabriquants();
  }

  public getCategories() {

    this.categorieService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;

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

  public getRayon() {

    this.rayonService.getRayons().subscribe({
      next: (data: any) => {
        this.rayons = data;

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

  public getMagasin() {

    this.magasinService.getMagasins().subscribe({
      next: (data: any) => {
        this.rayons = data;

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

  public getForme() {

    this.formeService.getFormes().subscribe({
      next: (data: any) => {

        this.formes = data;
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

  public getFabriquants() {

    this.fabriquantService.getFabriquants().subscribe({
      next: (data: any) => {
        this.formes = data;

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

  public getEtagere() {

    this.etageresService.getEtageress().subscribe({
      next: (data: any) => {
        this.etagere = data;

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

  public getProductById() {
    this.productService.getProductById(this.id).subscribe((data: any) => {
      this.form.patchValue(data);
    });
  }

  public onSubmit() {

  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }

}
