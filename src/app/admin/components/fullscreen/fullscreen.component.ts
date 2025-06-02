import { Component, ViewEncapsulation, ViewChild, HostListener, ElementRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomHandlerService } from '@services/dom-handler.service'; 

@Component({
    selector: 'app-fullscreen',
    imports: [
        MatButtonModule,
        MatIconModule
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
    <button mat-icon-button class="full-screen">
        @if (toggle) {
            <mat-icon #compress>fullscreen_exit</mat-icon>
        } @else {
            <mat-icon #expand>fullscreen</mat-icon>
        }  
    </button> 
  `
})
export class FullScreenComponent {
    toggle: boolean = false;
    @ViewChild('expand') private expand: ElementRef;
    @ViewChild('compress') private compress: ElementRef;
    domHandlerService = inject(DomHandlerService);
    document: any = this.domHandlerService.window?.document;

    
    requestFullscreen(elem: any) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else {
            console.log('Fullscreen API is not supported.');
        }
    };

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else {
            console.log('Fullscreen API is not supported.');
        }
    };

    @HostListener('click') getFullscreen(){
        if(this.expand){
            this.requestFullscreen(document.documentElement);
        }
        if(this.compress){
            this.exitFullscreen();
        }
    }

    @HostListener('window:resize') onFullScreenChange(){
        let fullscreenElement = document.fullscreenElement;
        if (fullscreenElement != null) {
            this.toggle = true;
        } else {
            this.toggle = false;          
        }
    }   

}