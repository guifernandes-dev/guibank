import { Classificacao, Operation } from "../constants/data.enum"

export interface Account {
  id: string,
  nome: string,
  email: string,
  saldo: number,
  senha: string,
  limit: number,
}

export interface Transaction {
  id: string,
  origem: string,
  destino: string,
  data: Date,
  descricao: string,
  valor: number,
  tipo: Operation,
  pago: boolean,
  vencimento: Date | null,
  classificacao: Classificacao
}