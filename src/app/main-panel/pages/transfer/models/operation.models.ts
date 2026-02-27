import { Operation } from "../../../../../server/constants/operation.enum";

export interface MenuOperation {
  icon: string,
  label: string,
  operation: Operation
}

export interface ErrorsForm {
  destino: string,
  descricao: string,
  vencimento: string,
  valor: string
}