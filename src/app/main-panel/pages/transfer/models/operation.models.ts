import { Operation } from "../../../../../server/constants/db.enum";

export interface MenuOperation {
  icon: string,
  label: string,
  operation: Operation
}

export interface ErrorsDialog {
  descricao: string,
  vencimento: string,
  valor: string
}

export interface ErrorsForm extends ErrorsDialog {
  conta: string,
  email: string
}

export interface TransAccount {
  id: string,
  email: string,
  nome: string,
}