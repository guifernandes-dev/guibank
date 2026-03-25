import { Component } from '@angular/core';
import { RouterModule} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    private translate: TranslateService
  ) {
    this.translate.addLangs(['pt-br', 'en-us']);
    this.translate.setFallbackLang(environment.defaultLang);
    const browserLang = this.translate.getBrowserCultureLang()?.toLocaleLowerCase();
    const lang = browserLang !== 'pt-br' ? 'en-us' : 'pt-br';
    this.translate.use(lang);
  }
}
