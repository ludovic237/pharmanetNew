import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MessagesService } from '@services/messages.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { PipesModule } from '../../../theme/pipes/pipes.module';

@Component({
    selector: 'app-messages',
    imports: [
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
        MatProgressBarModule,
        MatMenuModule,
        NgScrollbarModule,
        PipesModule
    ],
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.scss',
    encapsulation: ViewEncapsulation.None,
    providers: [MessagesService]
})
export class MessagesComponent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  public selectedTab: number = 1;
  public messages: any[];
  public files: any[];
  public meetings: any[];

  constructor(private messagesService: MessagesService) {
    this.messages = messagesService.getMessages();
    this.files = messagesService.getFiles();
    this.meetings = messagesService.getMeetings();
  }

  openMessagesMenu() {
    this.trigger.openMenu();
    this.selectedTab = 0;
  }

  onMouseLeave() {
    this.trigger.closeMenu();
  }

  stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

}
