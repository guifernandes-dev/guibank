import { TransAccount } from "../../app/main-panel/pages/transfer/models/operation.models"
import { Operation, SisCredito } from "../constants/db.enum"

export interface AccountResp {
  accessToken: string,
  user: Account
}

export interface Account {
  id: string,
  nome: string,
  email: string,
  renda: number,
}

export interface Login {
  email: string,
  password: string,
}

export interface Transaction {
  id: string,
  origem: TransAccount | null,
  destino: TransAccount | null,
  data: Date,
  descricao: string,
  valor: number,
  tipo: Operation,
  pago: boolean,
  vencimento: Date | null
}

export interface Loan {
  id?: string,
  data: Date,
  destino: TransAccount,
  valor: number,
  sistema: SisCredito,
  pago: boolean,
  taxa: number,
  parcelas: Installment[]
}

export interface Installment {
  item: number,
  amortizacao: number,
  saldo: number,
  vencimento: Date,
  pago: boolean,
  juros: number,
  parcela: number
}

export interface LoanTotal {
  juros: number,
  amortizacao: number,
  parcela: number,
  saldo: number
}

export interface CDIType {
  nome: string,
  valor: number
}