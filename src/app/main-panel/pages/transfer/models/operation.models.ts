import { Operation } from "../../../../../server/constants/operation.enum";

export interface MenuOperation {
  icon: string,
  label: string,
  operation: Operation
}

export interface ErrorsForm {
  conta: string,
  email: string,
  descricao: string,
  vencimento: string,
  valor: string
}

export interface TransAccount {
  conta: string,
  email: string,
  nome: string,
}