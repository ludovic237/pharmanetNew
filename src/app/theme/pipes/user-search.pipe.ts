import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'UserSearchPipe', pure: false,
    standalone: false
})
/*export class UserSearchPipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(user => {
        if (user.profile.name) {
          return user.profile.name.search(searchText) !== -1;
        }
        else{
          return user.username.search(searchText) !== -1;
        }
      });
    }
  }
}*/

export class UserSearchPipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return (
          fullName.search(searchText) !== -1 ||
          (user.email && user.email.search(searchText) !== -1)
        );
      });
    }
  }
}
