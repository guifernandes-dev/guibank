import { Component, inject, OnInit } from '@angular/core';
import { OperationService } from './services/operation.service';
import { MatIconModule } from "@angular/material/icon";
import { Operation } from '../../../../server/constants/data.enum';
import { first, Subject, takeUntil } from 'rxjs';
import { MenuOperation } from './models/operation.models';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../../core/login.services/login.service';
import { User } from '../../../core/models/services.model';

@Component({
  selector: 'app-transfer',
  imports: [MatIconModule, AsyncPipe, MatButtonModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent implements OnInit {
  private destroy$ = new Subject<void>();
  private formBuilder = inject(FormBuilder);
  private transferService = inject(OperationService);
  private loginService = inject(LoginService);
  private user!: User;
  private currentOp$ = this.transferService.currentOp;
  Operationform: FormGroup = this.formBuilder.group({
    origem: [''],
    destino: [''],
    data: ['', Validators.required],
    descricao: [''],
    valor: [0, Validators.min(0.01), Validators.required],
    tipo: ['', Validators.required],
    pago: [false],
    vencimento: [null],
    classificacao: ['', Validators.required]
  });

  ngOnInit(): void {
    this.currentOp
      .pipe(takeUntil(this.destroy$))
      .subscribe((op) => {
        this.buildForm(op);
      })
  }

  get operationItems() {
    return this.transferService.operationMenu;
  }

  get currentOp() {
    return this.currentOp$;
  }

  buildForm({operation, classificacao}: MenuOperation): void {
    let userLogged: User;
    this.loginService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        userLogged=user!
        const data = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Sao_Paulo",
          dateStyle: "short",
          timeStyle: "short"
        }).format(new Date()).substring(0,10);
        const temOrigem = [
          Operation.SAQUE,
          Operation.PAGAMENTO,
          Operation.PIX,
          Operation.DEBITO
        ].includes(operation);
        const origem = temOrigem ? userLogged.conta || '' : '';
        const destino = !temOrigem ? userLogged.conta || '' : '';
        this.Operationform.patchValue({
          origem,
          destino,
          data,
          tipo: operation,
          classificacao
        })
      })
  }

  disabledBtn(operation: Operation): boolean {
    let disabled = false;
    this.transferService.currentOp
      .pipe(first())
      .subscribe(currentOp => {
        if (currentOp.operation === operation) {
          disabled = true;
        }
      });
    return disabled;
  }

  changeOperation(operation: MenuOperation) {
    this.transferService.currentOp = operation;
  }

  submit(){

  }
}
