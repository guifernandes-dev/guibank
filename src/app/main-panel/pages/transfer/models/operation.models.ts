import { Classificacao, Operation } from "../../../../../server/constants/data.enum";

export interface MenuOperation {
  icon: string,
  label: string,
  operation: Operation,
  classificacao: Classificacao
}