import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterBrands',
    standalone: false
})
export class FilterBrandsPipe implements PipeTransform {
    transform(brands:Array<any>, firstLetter?: any) {
        if(firstLetter == 'all'){
            return brands;
        }
        else{            
            return brands.filter(brand => brand.name.charAt(0) == firstLetter.toLowerCase());
        }    
    }
}