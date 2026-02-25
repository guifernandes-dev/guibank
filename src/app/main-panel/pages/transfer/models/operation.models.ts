import { Classificacao, Operation } from "../../../../../server/constants/data.enum";
import { Transaction } from "../../../../../server/models/db.model";

export interface MenuOperation {
  icon: string,
  label: string,
  operation: Operation,
  classificacao: Classificacao
}

export interface ErrorsObj {
  key: keyof Transaction,
  code: string
}