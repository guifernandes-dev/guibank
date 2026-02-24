import { Classificacao, TipoLanc } from "../../../../../server/constants/data.enum";

export interface Operations {
  icon: string,
  label: string,
  operation: TipoLanc,
  classificacao: Classificacao
}