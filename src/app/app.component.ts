import { Component, inject } from '@angular/core';
import { RouterModule} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment.development';
import { UtilService } from './core/util.services/util.service';
import { LoginService } from './core/login.services/login.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

  constructor(
    private translate: TranslateService
  ) {
    this.translate.addLangs(this.utils.languages);
    this.translate.setFallbackLang(environment.defaultLang);
    this.utils.setLangAtual();
    this.translate.use(this.utils.langAtual().culture);
  }

  get isLoading() {
    return this.login.isLoading;
  }
}
