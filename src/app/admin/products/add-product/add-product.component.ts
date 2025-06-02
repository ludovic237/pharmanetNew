import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { Category } from '@models/category';
import { AppService } from '@services/app.service';
import { InputFileModule } from '../../../theme/components/input-file/input-file.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-add-product',
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        InputFileModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        FlexLayoutModule
    ],
    templateUrl: './add-product.component.html',
    styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit {
  public form: FormGroup;
  public colors = ["#5C6BC0", "#66BB6A", "#EF5350", "#BA68C8", "#FF4081", "#9575CD", "#90CAF9", "#B2DFDB", "#DCE775", "#FFD740", "#00E676", "#FBC02D", "#FF7043", "#F5F5F5", "#696969"];
  public sizes = ["S", "M", "L", "XL", "2XL", "32", "36", "38", "46", "52", "13.3\"", "15.4\"", "17\"", "21\"", "23.4\""];
  public selectedColors: string;
  public categories: Category[];
  private sub: any;
  public id: any;

  constructor(public appService: AppService, public formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      'name': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'images': null,
      "oldPrice": null,
      "newPrice": [null, Validators.required],
      "discount": null,
      "description": null,
      "availibilityCount": null,
      "color": null,
      "size": null,
      "weight": null,
      "categoryId": [null, Validators.required]
    });
    this.getCategories();
    this.sub = this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
        this.getProductById();
      }
    });
  }

  public getCategories() {
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      this.categories.shift();
    });
  }

  public getProductById() {
    this.appService.getProductById(this.id).subscribe((data: any) => {
      this.form.patchValue(data);
      this.selectedColors = data.color;
      const images: any[] = [];
      data.images.forEach((item: any) => {
        let image = {
          link: item.medium,
          preview: item.medium
        }
        images.push(image);
      })
      this.form.controls.images.setValue(images);
    });
  }

  public onSubmit() {
    console.log(this.form.value);
  }

  public onColorSelectionChange(event: any) {
    if (event.value) {
      this.selectedColors = event.value.join();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
