import { TransAccount } from "../../app/main-panel/pages/transfer/models/operation.models"
import { Operation } from "../constants/operation.enum"

export interface Account {
  id: string,
  nome: string,
  email: string,
  renda: number,
  senha: string,
  limit: number,
}

export interface Transaction {
  id?: string,
  origem: TransAccount | null,
  destino: TransAccount | null,
  data: Date,
  descricao: string,
  valor: number,
  tipo: Operation,
  pago: boolean,
  vencimento: Date | null
}