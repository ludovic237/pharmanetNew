import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Category } from '@models/category';
import { DomHandlerService } from '@services/dom-handler.service';

@Component({
    selector: 'app-category-list',
    imports: [
        MatMenuModule
    ],
    templateUrl: './category-list.component.html'
})
export class CategoryListComponent {
  @Input() categories: Category[];
  @Input() categoryParentId: any;
  @Output() change: EventEmitter<any> = new EventEmitter();
  mainCategories: Category[];

  constructor(public domHandlerService: DomHandlerService) { }

  public ngDoCheck() {
    if(this.categories && !this.mainCategories) {
      this.mainCategories = this.categories.filter(category => category.parentId == this.categoryParentId); 
    }
  }

  public stopClickPropagate(event: any){
    if(this.domHandlerService.window?.innerWidth < 960){
      event.stopPropagation();
      event.preventDefault();
    }    
  }

  public changeCategory(event: any){
    this.change.emit(event);
  }

}