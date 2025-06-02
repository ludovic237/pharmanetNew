import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { RouterModule } from '@angular/router';
import { PipesModule } from '../../theme/pipes/pipes.module';

@Component({
    selector: 'app-brands',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatInputModule,
        MatButtonToggleModule,
        FormsModule,
        PipesModule
    ],
    templateUrl: './brands.component.html',
    styleUrl: './brands.component.scss'
})
export class BrandsComponent implements OnInit {

  public letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "V", "W", "Y", "Z"];
  public brands: { name: string, image: string }[] = [];
  public searchText: string;

  constructor(public appService: AppService) { }

  ngOnInit() {
    this.brands = this.appService.getBrands();
    // this.brands.sort((a, b)=>{
    //   if(a.name < b.name) return -1;
    //   if(a.name > b.name) return 1;
    //   return 0;
    // });
  }

}
