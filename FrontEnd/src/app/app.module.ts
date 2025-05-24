import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routes } from './app.routes';
import { AppComponent } from './app.component'; // Componente principal*/
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';


//imports agenda
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AppointmentDialogComponent } from './appointment-dialog/appointment-dialog.component';

//imports agenda

//imports aluno no appointment
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

//imports aluno no appointment

@NgModule({
  declarations: [ 
  ],
  imports: [AppComponent,
    HeaderComponent,
    BrowserModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    AppointmentDialogComponent,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: []
})
export class AppModule {}
