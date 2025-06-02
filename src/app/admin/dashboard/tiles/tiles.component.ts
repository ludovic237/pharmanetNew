import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-tiles',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './tiles.component.html',
    styleUrl: './tiles.component.scss'
})
export class TilesComponent {

}
