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
  origem: string,
  destino: string,
  data: Date,
  descricao: string,
  valor: number,
  tipo: Operation,
  pago: boolean,
  vencimento: Date | null
}