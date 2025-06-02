import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '@models/category';
import { Product } from '@models/product';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AppService } from '@services/app.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { Settings, SettingsService } from '@services/settings.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductDialogComponent } from '@shared-components/product-dialog/product-dialog.component';
import { CategoryListComponent } from '@shared-components/category-list/category-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { RatingComponent } from '@shared-components/rating/rating.component';
import { ControlsComponent } from '@shared-components/controls/controls.component';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-products',
    imports: [
        RouterModule,
        FormsModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatMenuModule,
        MatChipsModule,
        NgScrollbarModule,
        MatSliderModule,
        MatCardModule,
        NgxPaginationModule,
        CategoryListComponent,
        RatingComponent,
        ControlsComponent,
        DecimalPipe,
        PipesModule
    ],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

  public json:any = {
    "categories": [
      {
        "id": "7762070814178001983",
        "name": "Community",
        "internalName": "community",
        "image": {
          "id": "HKHXiQTlNcUtU96nqbhOPQ1KS6Q3AMmwX0EgmpZv7Ys4F6nqZVsrAI9Z2eVGjqe7_340x240.png",
          "name": "community",
          "contentType": "image/png",
          "length": 173388,
          "url": "https://demo.cyclos.org/api/images/content/HKHXiQTlNcUtU96nqbhOPQ1KS6Q3AMmwX0EgmpZv7Ys4F6nqZVsrAI9Z2eVGjqe7_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "people",
        "svgIconColor": "#2196f3",
        "children": [
          {
            "id": "7762070814178002239",
            "name": "Activities",
            "image": {
              "id": "EY8EqW7IlBi7bbvLR1N7BhoL3TcwnntvVIwi34D4IOfIX4uJpwyuz6YBT7DUCQg7_220x220.png",
              "name": "community-activities",
              "contentType": "image/png",
              "length": 107313,
              "url": "https://demo.cyclos.org/api/images/content/EY8EqW7IlBi7bbvLR1N7BhoL3TcwnntvVIwi34D4IOfIX4uJpwyuz6YBT7DUCQg7_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178002495",
            "name": "Artists",
            "image": {
              "id": "ALv2epEVI3pAo5X8T0tNJMOjDMZOYjjkhqqpvFq57aLIR20MD7K1uKymIeHVMwHp_220x220.png",
              "name": "community-artists",
              "contentType": "image/png",
              "length": 113848,
              "url": "https://demo.cyclos.org/api/images/content/ALv2epEVI3pAo5X8T0tNJMOjDMZOYjjkhqqpvFq57aLIR20MD7K1uKymIeHVMwHp_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178002751",
            "name": "Childcare",
            "image": {
              "id": "O2axc51Wo0llGgFbLJv8cTA4xJCRlhee7W8IleYtnga5O8HfXrcwNUXdp2BMUbbO_220x220.png",
              "name": "community-childcare",
              "contentType": "image/png",
              "length": 90073,
              "url": "https://demo.cyclos.org/api/images/content/O2axc51Wo0llGgFbLJv8cTA4xJCRlhee7W8IleYtnga5O8HfXrcwNUXdp2BMUbbO_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178000959",
            "name": "Musicians",
            "image": {
              "id": "Zq6chDuofSLi1I8y0GYoAl7KU99qtO6ppwMdhlfyUOsdbly1qv7ZP37yDYxnVUrZ_220x220.png",
              "name": "community-musicians",
              "contentType": "image/png",
              "length": 108027,
              "url": "https://demo.cyclos.org/api/images/content/Zq6chDuofSLi1I8y0GYoAl7KU99qtO6ppwMdhlfyUOsdbly1qv7ZP37yDYxnVUrZ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178001215",
            "name": "Local news",
            "image": {
              "id": "iTTGPvmhfSZoZ4nXGbNY2asuzasxQZJxq72s2RfZKEn7MOV52fPwRsjPNuegB1Fj_220x220.png",
              "name": "community-localNews",
              "contentType": "image/png",
              "length": 70922,
              "url": "https://demo.cyclos.org/api/images/content/iTTGPvmhfSZoZ4nXGbNY2asuzasxQZJxq72s2RfZKEn7MOV52fPwRsjPNuegB1Fj_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178001471",
            "name": "Politics",
            "image": {
              "id": "9iLUt2gHqufkcZCw1SvCkHhKZzYegc07NPZH6isB1io5FqHqBUEzKEJFj2pup7xA_220x220.png",
              "name": "community-politics",
              "contentType": "image/png",
              "length": 108463,
              "url": "https://demo.cyclos.org/api/images/content/9iLUt2gHqufkcZCw1SvCkHhKZzYegc07NPZH6isB1io5FqHqBUEzKEJFj2pup7xA_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178001727",
            "name": "Rideshare",
            "image": {
              "id": "OcXcCiYJBGKp0ttHvDHb9Op0vNtrbnwF752iRNT5ozjT7kHnFQ251GYvYzOoC1A2_220x220.png",
              "name": "community-rideshare",
              "contentType": "image/png",
              "length": 105605,
              "url": "https://demo.cyclos.org/api/images/content/OcXcCiYJBGKp0ttHvDHb9Op0vNtrbnwF752iRNT5ozjT7kHnFQ251GYvYzOoC1A2_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178008127",
            "name": "Volunteers",
            "image": {
              "id": "WVrv5s2NbH3e8bGBaKSBqBqEVWQIiPvqwMGEdnH3cQaP39u8HFkTSQi5FGKzEjiu_220x220.png",
              "name": "community-volunteers",
              "contentType": "image/png",
              "length": 102965,
              "url": "https://demo.cyclos.org/api/images/content/WVrv5s2NbH3e8bGBaKSBqBqEVWQIiPvqwMGEdnH3cQaP39u8HFkTSQi5FGKzEjiu_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178008383",
            "name": "Classes",
            "image": {
              "id": "szTgfasJiD5LVMlTy3XysbSM0Q5UCJPA0HPydSsn4ZmEIX9XAJxPG4juDoeSp26z_220x220.png",
              "name": "community-classes",
              "contentType": "image/png",
              "length": 71084,
              "url": "https://demo.cyclos.org/api/images/content/szTgfasJiD5LVMlTy3XysbSM0Q5UCJPA0HPydSsn4ZmEIX9XAJxPG4juDoeSp26z_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178006847",
            "name": "Other",
            "image": {
              "id": "JA9SI3Gc571nLua2P8fMH2O4oyqSz6BL1Y3bG27fLFeKqWq6sxX4gEfheSqGtyj0_220x220.png",
              "name": "community-other",
              "contentType": "image/png",
              "length": 113925,
              "url": "https://demo.cyclos.org/api/images/content/JA9SI3Gc571nLua2P8fMH2O4oyqSz6BL1Y3bG27fLFeKqWq6sxX4gEfheSqGtyj0_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178012479",
        "name": "Food",
        "internalName": "food",
        "image": {
          "id": "R7cxqfxBwQJDfR4xhgNsVFNiLPf8GMKQEvwCYyxEOcCKFzoWvd8gVyTwCxeIiF4S_340x240.png",
          "name": "food",
          "contentType": "image/png",
          "length": 117350,
          "url": "https://demo.cyclos.org/api/images/content/R7cxqfxBwQJDfR4xhgNsVFNiLPf8GMKQEvwCYyxEOcCKFzoWvd8gVyTwCxeIiF4S_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "fork-knife",
        "svgIconColor": "#f04d4e",
        "children": [
          {
            "id": "7762070814178011711",
            "name": "Baking",
            "image": {
              "id": "rUYium42se19Y5dw82sq5vZfX5H5LRy6LWm9GbnSIovR2RNA1l2ZhjC7Y4hobOUR_220x220.png",
              "name": "food-baking",
              "contentType": "image/png",
              "length": 78895,
              "url": "https://demo.cyclos.org/api/images/content/rUYium42se19Y5dw82sq5vZfX5H5LRy6LWm9GbnSIovR2RNA1l2ZhjC7Y4hobOUR_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177998399",
            "name": "Beverages",
            "image": {
              "id": "K4vCZDStW1hdCru5UAo1LGyrkg3uDfBJvzcYRU6Jd75cLOKtYCPx9fYUjbEVJfnk_220x220.png",
              "name": "food-beverages",
              "contentType": "image/png",
              "length": 108401,
              "url": "https://demo.cyclos.org/api/images/content/K4vCZDStW1hdCru5UAo1LGyrkg3uDfBJvzcYRU6Jd75cLOKtYCPx9fYUjbEVJfnk_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178011967",
            "name": "Catering",
            "image": {
              "id": "MUPsBvZeqC82uopzMDQBbP5oBjMrfz3hysNXP7UM7OT51qDX4MOY7becsh5MHJNH_220x220.png",
              "name": "food-catering",
              "contentType": "image/png",
              "length": 93000,
              "url": "https://demo.cyclos.org/api/images/content/MUPsBvZeqC82uopzMDQBbP5oBjMrfz3hysNXP7UM7OT51qDX4MOY7becsh5MHJNH_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178010175",
            "name": "Meal Preparation",
            "image": {
              "id": "1Hck6pZJZLlBVl7pZpglyirLEZYsdjXj4nWmiiXv1ejNq4NIRDBMwE7HjuBp9Lud_220x220.png",
              "name": "food-mealPreparation",
              "contentType": "image/png",
              "length": 77622,
              "url": "https://demo.cyclos.org/api/images/content/1Hck6pZJZLlBVl7pZpglyirLEZYsdjXj4nWmiiXv1ejNq4NIRDBMwE7HjuBp9Lud_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177999679",
            "name": "Pastry",
            "image": {
              "id": "hY8L5nv48TTKg80oXnjS2Q1o0pZzV71zW7m9yB6hjFM5wtEtwABYsZJuvFn8fWsu_220x220.png",
              "name": "food-pastry",
              "contentType": "image/png",
              "length": 95990,
              "url": "https://demo.cyclos.org/api/images/content/hY8L5nv48TTKg80oXnjS2Q1o0pZzV71zW7m9yB6hjFM5wtEtwABYsZJuvFn8fWsu_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178010431",
            "name": "Vegetarian",
            "image": {
              "id": "aP9K6pVXvGcjIfNp8nsp87wh4mTn3cjU1BnDzOUVX79g70GSAJOZkEnwxaTGTQBK_220x220.png",
              "name": "food-vegetarian",
              "contentType": "image/png",
              "length": 97066,
              "url": "https://demo.cyclos.org/api/images/content/aP9K6pVXvGcjIfNp8nsp87wh4mTn3cjU1BnDzOUVX79g70GSAJOZkEnwxaTGTQBK_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178010687",
            "name": "Other",
            "image": {
              "id": "9kPYKHk3HQLhsWMvEDamjKcnbfJqqBrtWW5abqgEni5HZ2XupkYixxSClsna5XCV_220x220.png",
              "name": "food-other",
              "contentType": "image/png",
              "length": 74720,
              "url": "https://demo.cyclos.org/api/images/content/9kPYKHk3HQLhsWMvEDamjKcnbfJqqBrtWW5abqgEni5HZ2XupkYixxSClsna5XCV_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178012735",
        "name": "Goods",
        "internalName": "goods",
        "image": {
          "id": "dvoTDbFSkVN9acBnN37KkOJPXysQtkLfZ3K9WOnQXuVbgzXe8xqSuYyHfB8AuR8z_340x240.png",
          "name": "goods",
          "contentType": "image/png",
          "length": 96860,
          "url": "https://demo.cyclos.org/api/images/content/dvoTDbFSkVN9acBnN37KkOJPXysQtkLfZ3K9WOnQXuVbgzXe8xqSuYyHfB8AuR8z_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "bag",
        "svgIconColor": "#ff9700",
        "children": [
          {
            "id": "7762070814178010943",
            "name": "Clothing",
            "image": {
              "id": "iMWpXfhhn3QtJNVdGwzEz8h8GcqzaUz9VAnRx1KyWx5U57yicQumago2cWXaUluc_220x220.png",
              "name": "goods-clothing",
              "contentType": "image/png",
              "length": 101310,
              "url": "https://demo.cyclos.org/api/images/content/iMWpXfhhn3QtJNVdGwzEz8h8GcqzaUz9VAnRx1KyWx5U57yicQumago2cWXaUluc_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178009151",
            "name": "Consumer electronics",
            "image": {
              "id": "bWOkxLuWiDL2ux15S5pb0qcfHY70ZUyh3SNz0MGv4K9cBTS4BrwuNkGmBDLNW0v7_220x220.png",
              "name": "goods-consumerElectronics",
              "contentType": "image/png",
              "length": 91382,
              "url": "https://demo.cyclos.org/api/images/content/bWOkxLuWiDL2ux15S5pb0qcfHY70ZUyh3SNz0MGv4K9cBTS4BrwuNkGmBDLNW0v7_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178009407",
            "name": "House, Garden",
            "image": {
              "id": "3qQ2C8Sc0FWhRPiqVOYsI4RDvDB4IQNIxKIAwR9Z5eUgISNjGJ4dj8StPlR32P34_220x220.png",
              "name": "goods-houseGarden",
              "contentType": "image/png",
              "length": 118524,
              "url": "https://demo.cyclos.org/api/images/content/3qQ2C8Sc0FWhRPiqVOYsI4RDvDB4IQNIxKIAwR9Z5eUgISNjGJ4dj8StPlR32P34_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178009663",
            "name": "Sports Equipment",
            "image": {
              "id": "SQ6y4FvJEJKqUvFdMNlMAvxvQIxVHiC3rPKDGLpqdiHvHmA5czfC5DNWtZ2McFz4_220x220.png",
              "name": "goods-sportsEquipment",
              "contentType": "image/png",
              "length": 50074,
              "url": "https://demo.cyclos.org/api/images/content/SQ6y4FvJEJKqUvFdMNlMAvxvQIxVHiC3rPKDGLpqdiHvHmA5czfC5DNWtZ2McFz4_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178009919",
            "name": "Vehicles",
            "image": {
              "id": "XjLex8WEEWValxzjsDOD2HmuKVZT5gXQz0WAlQ7wzXIH0MIlstWaqxjvLhwqVxyG_220x220.png",
              "name": "goods-vehicles",
              "contentType": "image/png",
              "length": 96843,
              "url": "https://demo.cyclos.org/api/images/content/XjLex8WEEWValxzjsDOD2HmuKVZT5gXQz0WAlQ7wzXIH0MIlstWaqxjvLhwqVxyG_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177997887",
            "name": "Antiques",
            "image": {
              "id": "4dfzfIDlTLsEN0kzg9vU1pGBy2WlUggShTZ8tOSL2C8AcQCxSo2XDoCbJjcbgM1e_220x220.png",
              "name": "goods-antiques",
              "contentType": "image/png",
              "length": 105009,
              "url": "https://demo.cyclos.org/api/images/content/4dfzfIDlTLsEN0kzg9vU1pGBy2WlUggShTZ8tOSL2C8AcQCxSo2XDoCbJjcbgM1e_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178016319",
            "name": "Other",
            "image": {
              "id": "CqpIlyGxliaPBe5XmmjaQMiNnUVgbPaUHgKlCtz2sEO6sBeKooG7sfnJZBf67VUm_220x220.png",
              "name": "goods-other",
              "contentType": "image/png",
              "length": 52998,
              "url": "https://demo.cyclos.org/api/images/content/CqpIlyGxliaPBe5XmmjaQMiNnUVgbPaUHgKlCtz2sEO6sBeKooG7sfnJZBf67VUm_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178008639",
        "name": "Housing",
        "internalName": "housing",
        "image": {
          "id": "WV9a0mWkldDMqzERVQ9lAefcLz22ROb8GbC9t3SqymPb0EsqDNv7U22pUTV8LoAH_340x240.png",
          "name": "housing",
          "contentType": "image/png",
          "length": 181675,
          "url": "https://demo.cyclos.org/api/images/content/WV9a0mWkldDMqzERVQ9lAefcLz22ROb8GbC9t3SqymPb0EsqDNv7U22pUTV8LoAH_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "building",
        "svgIconColor": "#029487",
        "children": [
          {
            "id": "7762070814178008895",
            "name": "Apartments / housing",
            "image": {
              "id": "QauxAVKBhpxxxGCGnhDqwD6qqfLHt4y18XjebGnOMbElZfkyq7eBGtcb8vk4PIQP_220x220.png",
              "name": "housing-apartmentsHousing",
              "contentType": "image/png",
              "length": 95213,
              "url": "https://demo.cyclos.org/api/images/content/QauxAVKBhpxxxGCGnhDqwD6qqfLHt4y18XjebGnOMbElZfkyq7eBGtcb8vk4PIQP_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178007103",
            "name": "Rooms / shared",
            "image": {
              "id": "eaO3GukzJ8QKeZSgxV3iJ5if2TaYSnXmxVNOU9XhsVXRf55jOGYVg5kOU7366ACK_220x220.png",
              "name": "housing-roomsShared",
              "contentType": "image/png",
              "length": 71110,
              "url": "https://demo.cyclos.org/api/images/content/eaO3GukzJ8QKeZSgxV3iJ5if2TaYSnXmxVNOU9XhsVXRf55jOGYVg5kOU7366ACK_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178007359",
            "name": "Sublets / temporary",
            "image": {
              "id": "ass0vfe0vSusZUh24Zu2DTAcnWbZX04JDz1KoTIfRCrCf42NgF6apBe8PBbQE21S_220x220.png",
              "name": "housing-subletsTemporary",
              "contentType": "image/png",
              "length": 52140,
              "url": "https://demo.cyclos.org/api/images/content/ass0vfe0vSusZUh24Zu2DTAcnWbZX04JDz1KoTIfRCrCf42NgF6apBe8PBbQE21S_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178007615",
            "name": "Vacation rentals",
            "image": {
              "id": "z4KOBTGRXrh0BD0rlRasVPm4f2RLwkdYg6DhNXn6R9JGoePqA6KrxfOwcw84vBBJ_220x220.png",
              "name": "housing-vacationRentals",
              "contentType": "image/png",
              "length": 113111,
              "url": "https://demo.cyclos.org/api/images/content/z4KOBTGRXrh0BD0rlRasVPm4f2RLwkdYg6DhNXn6R9JGoePqA6KrxfOwcw84vBBJ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178007871",
            "name": "Parking",
            "image": {
              "id": "dB4tCykW0tAnmvnvBYxRdh9a0aL4TA7QvHwrzW0fcjZxRhl8ZvVa6kvCZ0qXW1r6_220x220.png",
              "name": "housing-parking",
              "contentType": "image/png",
              "length": 83781,
              "url": "https://demo.cyclos.org/api/images/content/dB4tCykW0tAnmvnvBYxRdh9a0aL4TA7QvHwrzW0fcjZxRhl8ZvVa6kvCZ0qXW1r6_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178006079",
            "name": "Storage",
            "image": {
              "id": "BnrkoJhIqwT52lSZcKBVf5HnoFLDPWu98n2ufwBsjbZ4dwTAfSV1Zo8F6UJe1sYQ_220x220.png",
              "name": "housing-storage",
              "contentType": "image/png",
              "length": 80962,
              "url": "https://demo.cyclos.org/api/images/content/BnrkoJhIqwT52lSZcKBVf5HnoFLDPWu98n2ufwBsjbZ4dwTAfSV1Zo8F6UJe1sYQ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178006335",
            "name": "Office / commercial",
            "image": {
              "id": "oDD3mBTYmjAYlQ6wjyeK4KN8JFWe3UwVOwbJYlyiOrIuCsjXOskCc2zdrIv69yse_220x220.png",
              "name": "housing-officeCommercial",
              "contentType": "image/png",
              "length": 81210,
              "url": "https://demo.cyclos.org/api/images/content/oDD3mBTYmjAYlQ6wjyeK4KN8JFWe3UwVOwbJYlyiOrIuCsjXOskCc2zdrIv69yse_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178006591",
            "name": "Real estate for sale",
            "image": {
              "id": "sflmGrducCFu2fdsPFmUbjpMnpU2FYeqi9WIy836sAdJBVutvMcXNnYNFaHzc1rB_220x220.png",
              "name": "housing-realEstateForSale",
              "contentType": "image/png",
              "length": 70628,
              "url": "https://demo.cyclos.org/api/images/content/sflmGrducCFu2fdsPFmUbjpMnpU2FYeqi9WIy836sAdJBVutvMcXNnYNFaHzc1rB_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178005055",
            "name": "Other",
            "image": {
              "id": "4B1Z5dPu7NslgdtGu6RfSa89Wcwx9l1BnR3nfOZADYzu0dhbnOoFhYD0tp9tgZXU_220x220.png",
              "name": "housing-other",
              "contentType": "image/png",
              "length": 105313,
              "url": "https://demo.cyclos.org/api/images/content/4B1Z5dPu7NslgdtGu6RfSa89Wcwx9l1BnR3nfOZADYzu0dhbnOoFhYD0tp9tgZXU_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178012991",
        "name": "Labor",
        "internalName": "labor",
        "image": {
          "id": "1GALTyidsuzwm3zPO5zX3zqh1m4c9KMUCyDehE7uLU1h8gadDE7Y9d8PgNhSHzXd_340x240.png",
          "name": "labor",
          "contentType": "image/png",
          "length": 120892,
          "url": "https://demo.cyclos.org/api/images/content/1GALTyidsuzwm3zPO5zX3zqh1m4c9KMUCyDehE7uLU1h8gadDE7Y9d8PgNhSHzXd_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "tools",
        "svgIconColor": "#de3eaa",
        "children": [
          {
            "id": "7762070814178016575",
            "name": "Electrical",
            "image": {
              "id": "M0YjVK7bQrxe8ecDgoajgYTOPRDLPepfqa7U68NUoxuYAPaB0TNGIi8EsnhnZqOH_220x220.png",
              "name": "labor-electrical",
              "contentType": "image/png",
              "length": 71014,
              "url": "https://demo.cyclos.org/api/images/content/M0YjVK7bQrxe8ecDgoajgYTOPRDLPepfqa7U68NUoxuYAPaB0TNGIi8EsnhnZqOH_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178016831",
            "name": "General",
            "image": {
              "id": "BFJu8M1KEM6Zg7NlqZgskwXJuMAVZPyX16sFWnGPLIjS2nBgkU7mRZrSI6hPOOjc_220x220.png",
              "name": "labor-general",
              "contentType": "image/png",
              "length": 92505,
              "url": "https://demo.cyclos.org/api/images/content/BFJu8M1KEM6Zg7NlqZgskwXJuMAVZPyX16sFWnGPLIjS2nBgkU7mRZrSI6hPOOjc_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178017087",
            "name": "Mechanical",
            "image": {
              "id": "NJGIWSuSa0qzVHVoLOwsFWaKepX6IbpHNd5ArBztkVvZFGvLzcrdIwEMapalsBOp_220x220.png",
              "name": "labor-mechanical",
              "contentType": "image/png",
              "length": 28725,
              "url": "https://demo.cyclos.org/api/images/content/NJGIWSuSa0qzVHVoLOwsFWaKepX6IbpHNd5ArBztkVvZFGvLzcrdIwEMapalsBOp_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178015295",
            "name": "Painting",
            "image": {
              "id": "YeOc3bVZlneuT6Sdv4MAz8agnnSKxSq67nfJ0Z4RU90BYcZYZ7vFyfjnQprLZjne_220x220.png",
              "name": "labor-painting",
              "contentType": "image/png",
              "length": 24378,
              "url": "https://demo.cyclos.org/api/images/content/YeOc3bVZlneuT6Sdv4MAz8agnnSKxSq67nfJ0Z4RU90BYcZYZ7vFyfjnQprLZjne_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178015551",
            "name": "Plumbing",
            "image": {
              "id": "GKuoJfEoHnlHEQupngKKp0gP36KSfhO0KIYdaXJyvCaTRJaC8RGXV3YGY33nvMsD_220x220.png",
              "name": "labor-plumbing",
              "contentType": "image/png",
              "length": 107426,
              "url": "https://demo.cyclos.org/api/images/content/GKuoJfEoHnlHEQupngKKp0gP36KSfhO0KIYdaXJyvCaTRJaC8RGXV3YGY33nvMsD_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178015807",
            "name": "Renovation",
            "image": {
              "id": "mLRHzNR40Gc3j9dZJrPmuIwcpnWQcUfWbn188FofolRAyGNFERHbZjwuzqlmFkXp_220x220.png",
              "name": "labor-renovation",
              "contentType": "image/png",
              "length": 96702,
              "url": "https://demo.cyclos.org/api/images/content/mLRHzNR40Gc3j9dZJrPmuIwcpnWQcUfWbn188FofolRAyGNFERHbZjwuzqlmFkXp_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178016063",
            "name": "Agriculture",
            "image": {
              "id": "jqmfT5NuftYAVZU01qm3Z56d12rvsAhedsl52ux5mgrik0WOcjoqLXxjQ9qfgr2F_220x220.png",
              "name": "labor-agriculture",
              "contentType": "image/png",
              "length": 89075,
              "url": "https://demo.cyclos.org/api/images/content/jqmfT5NuftYAVZU01qm3Z56d12rvsAhedsl52ux5mgrik0WOcjoqLXxjQ9qfgr2F_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178014271",
            "name": "Other",
            "image": {
              "id": "xjXK4ME0Qx0F7hgQyrWGDTfkfP1Df2jWoFVLFGi30COTUgpptYAmPFHOXvDp0YAv_220x220.png",
              "name": "labor-other",
              "contentType": "image/png",
              "length": 75706,
              "url": "https://demo.cyclos.org/api/images/content/xjXK4ME0Qx0F7hgQyrWGDTfkfP1Df2jWoFVLFGi30COTUgpptYAmPFHOXvDp0YAv_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178011199",
        "name": "Leisure",
        "internalName": "leisure",
        "image": {
          "id": "L2KI8Uox3gwOOwRzH9c2AtzyqlJML19UJsn6J8Y2YOdL5cirsyk7KQdEjZndLjgl_340x240.png",
          "name": "leisure",
          "contentType": "image/png",
          "length": 106074,
          "url": "https://demo.cyclos.org/api/images/content/L2KI8Uox3gwOOwRzH9c2AtzyqlJML19UJsn6J8Y2YOdL5cirsyk7KQdEjZndLjgl_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "emoji-smile",
        "svgIconColor": "#687ebd",
        "children": [
          {
            "id": "7762070814177998655",
            "name": "Concerts",
            "image": {
              "id": "qIs5qvejm6NZIBo9FKxR3qqokzRyNA3q3Nv4iGO0ZGEZSl9gor9vkIbqI4o4Wn4s_220x220.png",
              "name": "leisure-concerts",
              "contentType": "image/png",
              "length": 76978,
              "url": "https://demo.cyclos.org/api/images/content/qIs5qvejm6NZIBo9FKxR3qqokzRyNA3q3Nv4iGO0ZGEZSl9gor9vkIbqI4o4Wn4s_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177998143",
            "name": "Events",
            "image": {
              "id": "SGlx1OZI84hZI8fCBuHFoxtmmhmrgJXJZMw89yML1WVeus5DQKJAXza1zzbVenAu_220x220.png",
              "name": "leisure-events",
              "contentType": "image/png",
              "length": 78324,
              "url": "https://demo.cyclos.org/api/images/content/SGlx1OZI84hZI8fCBuHFoxtmmhmrgJXJZMw89yML1WVeus5DQKJAXza1zzbVenAu_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178014527",
            "name": "Hotels",
            "image": {
              "id": "gUCO3Q09vIGgN9HcoOYPHyJT1sjSkGZ2k1tr8AwqHJNLzZLdcfTLP967YqmA59P2_220x220.png",
              "name": "leisure-hotels",
              "contentType": "image/png",
              "length": 101916,
              "url": "https://demo.cyclos.org/api/images/content/gUCO3Q09vIGgN9HcoOYPHyJT1sjSkGZ2k1tr8AwqHJNLzZLdcfTLP967YqmA59P2_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178014783",
            "name": "Restaurants, Bars",
            "image": {
              "id": "rJghdQzq53S8HP3IhuCEepcVfn6TTSav0GFaMF5wQPNEYizIOn59fulc4suobzDl_220x220.png",
              "name": "leisure-restaurantsBars",
              "contentType": "image/png",
              "length": 101339,
              "url": "https://demo.cyclos.org/api/images/content/rJghdQzq53S8HP3IhuCEepcVfn6TTSav0GFaMF5wQPNEYizIOn59fulc4suobzDl_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178015039",
            "name": "Sports",
            "image": {
              "id": "qIaCz1qarXTl2fXEzPOlG43QlzvwM6lpbxVLFvTPtZ4j8M8eVSDvzcLUMzOXkKDQ_220x220.png",
              "name": "leisure-sports",
              "contentType": "image/png",
              "length": 85943,
              "url": "https://demo.cyclos.org/api/images/content/qIaCz1qarXTl2fXEzPOlG43QlzvwM6lpbxVLFvTPtZ4j8M8eVSDvzcLUMzOXkKDQ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178013247",
            "name": "Traveling",
            "image": {
              "id": "P2K9mcVfSJiGF4vVpug5E5uQFKbxpmVSqOEQTpXVR2RkmusbpG96gCTCWdlL2r8C_220x220.png",
              "name": "leisure-traveling",
              "contentType": "image/png",
              "length": 95041,
              "url": "https://demo.cyclos.org/api/images/content/P2K9mcVfSJiGF4vVpug5E5uQFKbxpmVSqOEQTpXVR2RkmusbpG96gCTCWdlL2r8C_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178013503",
            "name": "Other",
            "image": {
              "id": "DjyS3uyn80TVAAKB3GlJl5lecwsDBvmXAFqmTTdS8gtKTHHT2rtHo2Qeb1rws3I7_220x220.png",
              "name": "leisure-other",
              "contentType": "image/png",
              "length": 65341,
              "url": "https://demo.cyclos.org/api/images/content/DjyS3uyn80TVAAKB3GlJl5lecwsDBvmXAFqmTTdS8gtKTHHT2rtHo2Qeb1rws3I7_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178005311",
        "name": "Jobs",
        "internalName": "jobs",
        "image": {
          "id": "wkFpeUXUHtY735DbAuy3rmXEc2u8dkGubYMzO7HMYC7CnmMz0UHF5tKzzq27gsuW_340x240.png",
          "name": "jobs",
          "contentType": "image/png",
          "length": 154659,
          "url": "https://demo.cyclos.org/api/images/content/wkFpeUXUHtY735DbAuy3rmXEc2u8dkGubYMzO7HMYC7CnmMz0UHF5tKzzq27gsuW_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "briefcase",
        "svgIconColor": "#8062b3",
        "children": [
          {
            "id": "7762070814177996095",
            "name": "Art / media / design",
            "image": {
              "id": "YWVgcHgElC6gRjeH6wmD5uPYSuzvViFvOCzbKskj75gBiBCSds6O3dbFvLtF5riA_220x220.png",
              "name": "jobs-artMediaDesign",
              "contentType": "image/png",
              "length": 93053,
              "url": "https://demo.cyclos.org/api/images/content/YWVgcHgElC6gRjeH6wmD5uPYSuzvViFvOCzbKskj75gBiBCSds6O3dbFvLtF5riA_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177996351",
            "name": "Business / management",
            "image": {
              "id": "A88Eba8vNRJstJFNfvHQWVfn5dPVseO3bMx4sF1iXFkLjvYT354betCXy4YNEZr2_220x220.png",
              "name": "jobs-businessManagement",
              "contentType": "image/png",
              "length": 19250,
              "url": "https://demo.cyclos.org/api/images/content/A88Eba8vNRJstJFNfvHQWVfn5dPVseO3bMx4sF1iXFkLjvYT354betCXy4YNEZr2_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177996607",
            "name": "Customer service",
            "image": {
              "id": "qdBA6Mk1ww5qUy9YP8uMtl0qfIouUfjDWgl7eR6Y48p0Yfddyyh0goPeUO1Tn6Tb_220x220.png",
              "name": "jobs-customerService",
              "contentType": "image/png",
              "length": 43307,
              "url": "https://demo.cyclos.org/api/images/content/qdBA6Mk1ww5qUy9YP8uMtl0qfIouUfjDWgl7eR6Y48p0Yfddyyh0goPeUO1Tn6Tb_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177994815",
            "name": "Education",
            "image": {
              "id": "dpZLAiHvv9TcRyVIrGJaevFeHAR6PZDXnCdiZb04JlXwsOX97Zb70xMaNKb2ASJv_220x220.png",
              "name": "jobs-education",
              "contentType": "image/png",
              "length": 75225,
              "url": "https://demo.cyclos.org/api/images/content/dpZLAiHvv9TcRyVIrGJaevFeHAR6PZDXnCdiZb04JlXwsOX97Zb70xMaNKb2ASJv_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177995327",
            "name": "Human resources",
            "image": {
              "id": "gtpjeUw35SUglf2ZGVzKkw3P2oVZipRLIqOG5zkiizJerMOddKfPOgCobNkZXwAY_220x220.png",
              "name": "jobs-humanResources",
              "contentType": "image/png",
              "length": 68180,
              "url": "https://demo.cyclos.org/api/images/content/gtpjeUw35SUglf2ZGVzKkw3P2oVZipRLIqOG5zkiizJerMOddKfPOgCobNkZXwAY_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177993791",
            "name": "Manufacturing",
            "image": {
              "id": "w5UrsTfd0zMbjrbfeezLUQociBHNvdZbbCI3WJJd1VC5fFQ3F9zPmfreooejH8dY_220x220.png",
              "name": "jobs-manufacturing",
              "contentType": "image/png",
              "length": 96708,
              "url": "https://demo.cyclos.org/api/images/content/w5UrsTfd0zMbjrbfeezLUQociBHNvdZbbCI3WJJd1VC5fFQ3F9zPmfreooejH8dY_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177994047",
            "name": "Marketing / pr / ad",
            "image": {
              "id": "dXi2B11UdCX2gThlmnCohFxIjtblcDjLILt82UykzZ7zL2Cl5ffRt8G9EZ1EMYub_220x220.png",
              "name": "jobs-marketingPrAd",
              "contentType": "image/png",
              "length": 85175,
              "url": "https://demo.cyclos.org/api/images/content/dXi2B11UdCX2gThlmnCohFxIjtblcDjLILt82UykzZ7zL2Cl5ffRt8G9EZ1EMYub_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177994303",
            "name": "Medical / health",
            "image": {
              "id": "2HZdwg9DVLCVgIlzHxxwLSPTqw8315jKtd5y0sdaKL9Ta7lRuea04Z0uPxj1grig_220x220.png",
              "name": "jobs-medicalHealth",
              "contentType": "image/png",
              "length": 56657,
              "url": "https://demo.cyclos.org/api/images/content/2HZdwg9DVLCVgIlzHxxwLSPTqw8315jKtd5y0sdaKL9Ta7lRuea04Z0uPxj1grig_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177994559",
            "name": "Nonprofit sector",
            "image": {
              "id": "rIEA9jhSTFdU68E3WUoFVP6bT5ARiAyfOV2kmaNtpFpH2fcefgnN9PvebH2330eQ_220x220.png",
              "name": "jobs-nonprofitSector",
              "contentType": "image/png",
              "length": 98600,
              "url": "https://demo.cyclos.org/api/images/content/rIEA9jhSTFdU68E3WUoFVP6bT5ARiAyfOV2kmaNtpFpH2fcefgnN9PvebH2330eQ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177993023",
            "name": "Retail / wholesale",
            "image": {
              "id": "JrTvPXM5S4z8pbpp8vL7SdRD5lQ0I85xDQ8t5IEmNnfiusM6JDhm0lcQMfWrrnfx_220x220.png",
              "name": "jobs-retailWholesale",
              "contentType": "image/png",
              "length": 102129,
              "url": "https://demo.cyclos.org/api/images/content/JrTvPXM5S4z8pbpp8vL7SdRD5lQ0I85xDQ8t5IEmNnfiusM6JDhm0lcQMfWrrnfx_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177999935",
            "name": "Security",
            "image": {
              "id": "hNRvbDpFHyC3KZ078Y43mYZGw2HvDfXCzFTdsOh1Hyll9BKNS4JvunSdL2WiBltm_220x220.png",
              "name": "jobs-security",
              "contentType": "image/png",
              "length": 56577,
              "url": "https://demo.cyclos.org/api/images/content/hNRvbDpFHyC3KZ078Y43mYZGw2HvDfXCzFTdsOh1Hyll9BKNS4JvunSdL2WiBltm_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178000703",
            "name": "Transport",
            "image": {
              "id": "w4EvZmotSiWnOFSznxeOIfT3nHE2cEtyBpMDBkJLLXlIkWKAFDAxb0BlU47lBUwh_220x220.png",
              "name": "jobs-transport",
              "contentType": "image/png",
              "length": 104858,
              "url": "https://demo.cyclos.org/api/images/content/w4EvZmotSiWnOFSznxeOIfT3nHE2cEtyBpMDBkJLLXlIkWKAFDAxb0BlU47lBUwh_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177998911",
            "name": "Web / info design",
            "image": {
              "id": "vsLcD55fFX7QAygEXEZap7Q8upjQ4OxS6QjhOky4xCs3XgT2F0r7JcXkqbmRVFq2_220x220.png",
              "name": "jobs-webInfoDesign",
              "contentType": "image/png",
              "length": 68480,
              "url": "https://demo.cyclos.org/api/images/content/vsLcD55fFX7QAygEXEZap7Q8upjQ4OxS6QjhOky4xCs3XgT2F0r7JcXkqbmRVFq2_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177999167",
            "name": "Writing / editing",
            "image": {
              "id": "f5WuImIseygx9NLSFEG3TVjesnhhSuyj32qiYDanEkcvBn42c8Vk9dcNxaYTwU2i_220x220.png",
              "name": "jobs-writingEditing",
              "contentType": "image/png",
              "length": 74113,
              "url": "https://demo.cyclos.org/api/images/content/f5WuImIseygx9NLSFEG3TVjesnhhSuyj32qiYDanEkcvBn42c8Vk9dcNxaYTwU2i_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814177999423",
            "name": "Other",
            "image": {
              "id": "H1fney66ygathXNSfJKprFVnZdBWxVxWOiZh9XmLvrWocT0TcEwAbZjZz5pHsQIJ_220x220.png",
              "name": "jobs-other",
              "contentType": "image/png",
              "length": 91817,
              "url": "https://demo.cyclos.org/api/images/content/H1fney66ygathXNSfJKprFVnZdBWxVxWOiZh9XmLvrWocT0TcEwAbZjZz5pHsQIJ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      },
      {
        "id": "7762070814178011455",
        "name": "Services",
        "internalName": "services",
        "image": {
          "id": "InyNLMp0hL3xwPOnp9UWOFyiPaEoNGb7hAojdbR9CFIcWdjwIB1IIennsu4lDJyw_340x240.png",
          "name": "services",
          "contentType": "image/png",
          "length": 135871,
          "url": "https://demo.cyclos.org/api/images/content/InyNLMp0hL3xwPOnp9UWOFyiPaEoNGb7hAojdbR9CFIcWdjwIB1IIennsu4lDJyw_340x240.png",
          "width": 340,
          "height": 240
        },
        "svgIcon": "clipboard-check",
        "svgIconColor": "#8ec63f",
        "children": [
          {
            "id": "7762070814178003775",
            "name": "Beauty",
            "image": {
              "id": "FOlorg474wh0BQZemdkoTdOsYfj4rpO1FfTH49ltlpACOc4dB6qgEpbWKV12EgZZ_220x220.png",
              "name": "services-beauty",
              "contentType": "image/png",
              "length": 90236,
              "url": "https://demo.cyclos.org/api/images/content/FOlorg474wh0BQZemdkoTdOsYfj4rpO1FfTH49ltlpACOc4dB6qgEpbWKV12EgZZ_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178013759",
            "name": "Consulting",
            "image": {
              "id": "yBxk2WAdShP2fmBu9y8CHvBYTa3avM5m3Qv2DKmerfP1wtWYCAZyVXUwtsxDBGyH_220x220.png",
              "name": "services-consulting",
              "contentType": "image/png",
              "length": 59958,
              "url": "https://demo.cyclos.org/api/images/content/yBxk2WAdShP2fmBu9y8CHvBYTa3avM5m3Qv2DKmerfP1wtWYCAZyVXUwtsxDBGyH_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178014015",
            "name": "Education",
            "image": {
              "id": "806RDojqMtP48Niri09apLkoe3QItlCSqi5ICNrVYYIMs8dY9P43Cxz7KgafWEjD_220x220.png",
              "name": "services-education",
              "contentType": "image/png",
              "length": 75225,
              "url": "https://demo.cyclos.org/api/images/content/806RDojqMtP48Niri09apLkoe3QItlCSqi5ICNrVYYIMs8dY9P43Cxz7KgafWEjD_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178004031",
            "name": "Entertainment",
            "image": {
              "id": "rXP3bys3gS4up4NJVCP0sZinYPMm3q0wDBzxfG70v7cDJ0OOXrcrq0RHFYMEpSrI_220x220.png",
              "name": "services-entertainment",
              "contentType": "image/png",
              "length": 81751,
              "url": "https://demo.cyclos.org/api/images/content/rXP3bys3gS4up4NJVCP0sZinYPMm3q0wDBzxfG70v7cDJ0OOXrcrq0RHFYMEpSrI_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178004287",
            "name": "Financial",
            "image": {
              "id": "rGF2GlbeAZzRQY0nOUfaj7vC8u1d34p2esVBbh8mPqtToC5kAJTfJXPy0Z8ojMoW_220x220.png",
              "name": "services-financial",
              "contentType": "image/png",
              "length": 86135,
              "url": "https://demo.cyclos.org/api/images/content/rGF2GlbeAZzRQY0nOUfaj7vC8u1d34p2esVBbh8mPqtToC5kAJTfJXPy0Z8ojMoW_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178004543",
            "name": "Health",
            "image": {
              "id": "jHBxRzo03Wf78yqMMHxdHTmjigKk23DoVxhK0PrzNe64yYkJwmuLJsQR7UWQoPOY_220x220.png",
              "name": "services-health",
              "contentType": "image/png",
              "length": 54770,
              "url": "https://demo.cyclos.org/api/images/content/jHBxRzo03Wf78yqMMHxdHTmjigKk23DoVxhK0PrzNe64yYkJwmuLJsQR7UWQoPOY_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178004799",
            "name": "IT, Telecom",
            "image": {
              "id": "41PWwhxW1yPKoNoeDzy6l8lzzJ7QmCRZefvN1IphGhZ52HlUNlRGhPH2FOogZO5c_220x220.png",
              "name": "services-itTelecom",
              "contentType": "image/png",
              "length": 45932,
              "url": "https://demo.cyclos.org/api/images/content/41PWwhxW1yPKoNoeDzy6l8lzzJ7QmCRZefvN1IphGhZ52HlUNlRGhPH2FOogZO5c_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178003007",
            "name": "Personal",
            "image": {
              "id": "ZZfrEs4iBPEYbBQWvln9f3dDsFaWdk3HxLjNMklwRqC4vNFkAyphmzY2MC16sWGl_220x220.png",
              "name": "services-personal",
              "contentType": "image/png",
              "length": 73871,
              "url": "https://demo.cyclos.org/api/images/content/ZZfrEs4iBPEYbBQWvln9f3dDsFaWdk3HxLjNMklwRqC4vNFkAyphmzY2MC16sWGl_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178003263",
            "name": "Transportation",
            "image": {
              "id": "E0apAMjC3DX5Kbvi1Er2Ah8cP4NpBLR5sWbeDI06Rge52yaxNYWdFqeBnptpkaKy_220x220.png",
              "name": "services-transportation",
              "contentType": "image/png",
              "length": 101729,
              "url": "https://demo.cyclos.org/api/images/content/E0apAMjC3DX5Kbvi1Er2Ah8cP4NpBLR5sWbeDI06Rge52yaxNYWdFqeBnptpkaKy_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          },
          {
            "id": "7762070814178003519",
            "name": "Other",
            "image": {
              "id": "PPIrpsEkQ7kWmgrsSBlUsu2hacayOKVKuqVrKDqVnPrwbkU7C4bwPNHXshfgkEoa_220x220.png",
              "name": "services-other",
              "contentType": "image/png",
              "length": 88541,
              "url": "https://demo.cyclos.org/api/images/content/PPIrpsEkQ7kWmgrsSBlUsu2hacayOKVKuqVrKDqVnPrwbkU7C4bwPNHXshfgkEoa_220x220.png",
              "width": 220,
              "height": 220
            },
            "children": []
          }
        ]
      }
    ],
    "customFields": [],
    "fieldsInBasicSearch": [],
    "fieldsInAdvancedSearch": [],
    "fieldsInList": [],
    "basicProfileFields": [],
    "customProfileFields": [
      {
        "id": "7762070814178863167",
        "name": "Business type",
        "internalName": "business_type",
        "type": "singleSelection",
        "control": "singleSelection",
        "kind": "user",
        "required": false,
        "size": "full",
        "allSelectedLabel": "All business",
        "possibleValueCategories": [],
        "hasValuesList": true,
        "possibleValues": [
          {
            "id": "7762070814179318335",
            "value": "Restaurants",
            "internalName": "restaurants"
          },
          {
            "id": "7762070814179318591",
            "value": "Supermarkets",
            "internalName": "supermarkets"
          },
          {
            "id": "7762070814179316799",
            "value": "Clothing",
            "internalName": "clothing"
          },
          {
            "id": "7762070814179317055",
            "value": "Furniture",
            "internalName": "furniture"
          },
          {
            "id": "7762070814179317311",
            "value": "Travel agencies",
            "internalName": "travel_agencies"
          },
          {
            "id": "7762070814179317567",
            "value": "Leisure",
            "internalName": "leisure"
          },
          {
            "id": "7762070814179315775",
            "value": "Financial",
            "internalName": "financial"
          },
          {
            "id": "7762070814179316031",
            "value": "Technical",
            "internalName": "technical"
          }
        ]
      }
    ],
    "currencies": [
      {
        "id": "7762070814178012479",
        "name": "Units",
        "internalName": "units",
        "symbol": "IU's",
        "suffix": " IU's",
        "transactionNumberPattern": "\\D\\E\\M\\-#####\\-\\N\\M\\R",
        "decimalDigits": 2
      }
    ],
    "searchByDistanceData": {
      "addresses": [
        {
          "id": "7762070814169944383",
          "name": "home",
          "addressLine1": "Oude gracht 2",
          "city": "Utrecht",
          "region": "Utrecht",
          "country": "NL",
          "location": {
            "latitude": 52.096175,
            "longitude": 5.116451
          }
        }
      ],
      "defaultValues": {
        "country": "US"
      },
      "distanceUnit": "kilometer"
    },
    "categoriesDisplay": "images",
    "visibleKinds": [
      "simple",
      "webshop"
    ],
    "addressFieldsInSearch": [],
    "groups": [],
    "hidePrice": false,
    "hideOwner": false,
    "query": {
      "page": 0,
      "pageSize": 40,
      "skipTotalCount": false,
      "profileFields": [],
      "customFields": [],
      "priceRange": [],
      "publicationPeriod": [],
      "expirationPeriod": [],
      "statuses": [],
      "orderBy": "date",
      "brokers": [],
      "groups": []
    },
    "resultType": "tiled",
    "adInitialSearchType": "categories"
  }
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen: boolean = true;
  private sub: any;
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public counts = [12, 24, 36];
  public count: any;
  public sortings = ['Sort by Default', 'Best match', 'Lowest first', 'Highest first'];
  public sort: any;
  public products: Array<Product> = [];
  public categories: Category[];
  public brands: { name: string, image: string, selected?: boolean }[] = [];
  public priceFrom: number = 750;
  public priceTo: number = 1599;
  public colors = [
    { name: "#5C6BC0", selected: false },
    { name: "#66BB6A", selected: false },
    { name: "#EF5350", selected: false },
    { name: "#BA68C8", selected: false },
    { name: "#FF4081", selected: false },
    { name: "#9575CD", selected: false },
    { name: "#90CAF9", selected: false },
    { name: "#B2DFDB", selected: false },
    { name: "#DCE775", selected: false },
    { name: "#FFD740", selected: false },
    { name: "#00E676", selected: false },
    { name: "#FBC02D", selected: false },
    { name: "#FF7043", selected: false },
    { name: "#F5F5F5", selected: false },
    { name: "#696969", selected: false }
  ];
  public sizes = [
    { name: "S", selected: false },
    { name: "M", selected: false },
    { name: "L", selected: false },
    { name: "XL", selected: false },
    { name: "2XL", selected: false },
    { name: "32", selected: false },
    { name: "36", selected: false },
    { name: "38", selected: false },
    { name: "46", selected: false },
    { name: "52", selected: false },
    { name: "13.3\"", selected: false },
    { name: "15.4\"", selected: false },
    { name: "17\"", selected: false },
    { name: "21\"", selected: false },
    { name: "23.4\"", selected: false }
  ];
  public page: any;
  public settings: Settings;

  constructor(public settingsService: SettingsService,
              private activatedRoute: ActivatedRoute,
              public appService: AppService,
              public dialog: MatDialog,
              private router: Router,
              public domHandlerService: DomHandlerService) {
              this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.count = this.counts[0];
    this.sort = this.sortings[0];
    this.sub = this.activatedRoute.params.subscribe(params => {
      //console.log(params['name']);
    });
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.sidenavOpen = false;
    };
    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    };

    this.getCategories();
    this.getBrands();
    this.getAllProducts();
  }

  public getAllProducts() {
    this.appService.getProducts("featured").subscribe(data => {
      this.products = data;
      //for show more product
      for (var index = 0; index < 3; index++) {
        this.products = this.products.concat(this.products);
      }
    });
  }

  public getCategories() {
    if (this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.categories = data;
        this.appService.Data.categories = data;
      });
    }
    else {
      this.categories = this.appService.Data.categories;
    }
    this.categories = this.transformCategoriesToFlatList(this.json);
  }

  // public transformCategories(json: any): Category[] {
  //   return json.categories.map((category: any) => ({
  //     id: category.id,
  //     name: category.name,
  //     hasSubCategory: category.children.length>0?false : true,
  //     hasSubCategory: category.image?.url || null,
  //     // image: category.image?.url || null,
  //     children: category.children ? this.transformCategories({ categories: category.children }) : []
  //   }));
  // }

  public transformCategoriesToFlatList(json: any): Category[] {
    const categories: Category[] = [];

    const processCategory = (category: any, parentId: number | null = null) => {
      console.log("category.id");
      console.log(category.id);
      console.log(parseInt(category.id));
      const transformedCategory = new Category(
        parseInt(category.id), // Convertir l'ID en nombre
        category.name,
        category.children && category.children.length > 0, // Vérifier si la catégorie a des sous-catégories
        parentId // ID du parent
      );
      categories.push(transformedCategory);

      // Traiter les enfants récursivement
      if (category.children && category.children.length > 0) {
        category.children.forEach((child: any) => processCategory(child, category.id));
      }
    };

    json.categories.forEach((category: any) => processCategory(category,0));
    return categories;
  }

  public getBrands() {
    this.brands = this.appService.getBrands();
    this.brands.forEach(brand => { brand.selected = false });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  public changeCount(count: any) {
    this.count = count;
    this.getAllProducts();
  }

  public changeSorting(sort: any) {
    this.sort = sort;
  }

  public changeViewType(viewType: string, viewCol: number) {
    this.viewType = viewType;
    this.viewCol = viewCol;
  }

  public openProductDialog(product: Product) {
    let dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if (product) {
        this.router.navigate(['/products', product.id, product.name]);
      }
    });
  }

  public onPageChanged(event: any) {
    this.page = event;
    this.getAllProducts();
    this.domHandlerService.winScroll(0, 0);
  }

  public onChangeCategory(event: any) {
    if (event.target) {
      this.router.navigate(['/products', event.target.innerText.toLowerCase()]);
    }
  }

}
