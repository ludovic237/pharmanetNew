import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-contact',
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        FlexLayoutModule,
        MatIconModule,
        MatInputModule
    ],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;

  constructor(public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  public onContactFormSubmit(values:Object):void {
    if (this.contactForm.valid) {
      console.log(values);
    }
  }

}
