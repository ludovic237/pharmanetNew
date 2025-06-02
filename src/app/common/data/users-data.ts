import { InMemoryDbService } from 'angular-in-memory-web-api';

export class UsersData implements InMemoryDbService {
  createDb() {
    const users = [
        {
            id: 1,
            username: "pretty",
            password: "pretty123",
            profile: {
                first_name: "Ashley",
                last_name: "Ahlberg",
                birthday: new Date(1981,2,29),
                gender: "female",
                image: "images/profile/ashley.jpg"
            },
            work: {
                company: "Google",
                position: "Product designer",
                salary: 5000
            },
            contacts:{
                email: "ashley@gmail.com",
                phone: "(202) 756-9756",
                address: "Washington"
            },
            settings:{
                isActive: true,
                isDeleted: false,
                registrationDate: "2012-10-13T12:20:40.511Z",
                joinedDate: "2017-04-21T18:25:43.511Z"
            }
        },
    ];
    return {users};
  }
}
