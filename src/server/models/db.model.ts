import { TipoLanc } from "../constants/tipo.enum"

export interface Account {
  id: string,
  nome: string,
  email: string,
  saldo: number,
  senha: string
}

export interface Transaction {
  id: number,
  origem: string,
  destino: string,
  data: Date,
  descricao: string,
  valor: number,
  tipo: TipoLanc
}