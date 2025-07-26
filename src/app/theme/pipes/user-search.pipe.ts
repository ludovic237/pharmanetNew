import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'UserSearchPipe', pure: false,
    standalone: false
})
export class UserSearchPipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(user => {
        if (user.nom) {
          return user.nom.search(searchText) !== -1;
        }
        else if (user.identifiant){
          return user.identifiant.search(searchText) !== -1;
        }
        else{
          return user.nom.search(searchText) !== -1;
        }
      });
    }
  }
}
