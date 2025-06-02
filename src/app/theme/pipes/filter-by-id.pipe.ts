import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterById',
    standalone: false
})
export class FilterByIdPipe implements PipeTransform {
  transform(items:Array<any>, id?: any) {
    return items.filter(item => item.id == id)[0];
  }
}