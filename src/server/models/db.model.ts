import { TransAccount } from "../../app/main-panel/pages/transfer/models/operation.models"
import { Operation, SisCredito } from "../constants/db.enum"

export interface Account {
  id: string,
  nome: string,
  email: string,
  renda: number,
  senha: string,
  limit: number,
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

export interface Installment {
  item: number,
  amortizacao: number,
  vencimento: Date,
  pago: boolean,
  juros: number,
  parcela: number
}

export interface Loan {
  id?: string,
  data: Date,
  conta: TransAccount,
  valor: number,
  sistema: SisCredito,
  totais: LoanTotal,
  taxa: number,
  parcelas: Installment[]
}

export interface LoanTotal {
  juros: number,
  amortizacao: number,
  parcela: number,
  taxa: number
}

export interface CDIType {
  nome: string,
  valor: number
}