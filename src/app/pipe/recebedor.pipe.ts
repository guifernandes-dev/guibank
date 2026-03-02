import { inject, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../server/models/db.model';
import { LoginService } from '../core/login.services/login.service';

@Pipe({
  name: 'recebedor'
})
export class RecebedorPipe implements PipeTransform {
  private readonly loginService = inject(LoginService)

  transform(trans: Transaction): string {
    const userLogged = this.loginService.user()?.conta;
    const origem = trans.origem;
    const destino = trans.destino;
    const recebedor = destino?.conta === userLogged
      ? origem
      : destino;
    if (!recebedor) return '';
    if (recebedor.conta === userLogged) return '';
    return `${recebedor.nome}`
  }

}
