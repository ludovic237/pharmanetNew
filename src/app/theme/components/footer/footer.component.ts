import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps'; 
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        GoogleMapsModule
    ],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit { 
  center: google.maps.LatLngLiteral = { lat: 40.678178, lng: -73.944158};
  zoom = 7;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [
    { lat: 40.678178, lng: -73.944158 }
  ];

  constructor() { }

  ngOnInit() { }

  subscribe(){ }

}