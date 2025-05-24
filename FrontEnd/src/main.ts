
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideHttpClient } from '@angular/common/http';
import { HeaderComponent } from './app/header/header.component';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Configura as rotas para o aplicativo
    provideHttpClient(),
    HeaderComponent 
  ]
}).catch(err => console.error(err));

/*
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { Router } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppModule } from './app.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));


bootstrapApplication(AppComponent, {

  providers: [
//    provideRouter(routes),
    importProvidersFrom(HttpClientModule, FormsModule) // Certifique-se que FormsModule está incluído
  ]
}).catch(err => console.error(err));
*/