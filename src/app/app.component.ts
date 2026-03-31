import { afterNextRender, Component, inject } from '@angular/core';
import { RouterModule} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment.development';
import { UtilService } from './core/util.services/util.service';
import { LoginService } from './core/login.services/login.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-root',
  imports: [RouterModule, MatProgressSpinnerModule],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly utils = inject(UtilService);
  private readonly login = inject(LoginService);
  private readonly dateAdapter = inject(DateAdapter);

  constructor(
    private translate: TranslateService
  ) {
    this.translate.addLangs(this.utils.languages);
    this.translate.setFallbackLang(environment.defaultLang);
    this.utils.setLangAtual();
    const lang = this.utils.langAtual().culture;
    this.translate.use(lang);
    afterNextRender(() => {
      // Sincroniza o idioma inicial no browser
      this.updateDateLocale(this.utils.langAtual().culture || lang);

      // Escuta mudanças futuras (clique em bandeirinhas, etc)
      this.translate.onLangChange.subscribe((event) => {        
        this.updateDateLocale(event.lang);
      });
    });
  }

  get isLoading() {
    return this.login.isLoading;
  }

  private updateDateLocale(lang: string) {
    this.dateAdapter.setLocale(lang);
  }
}
