import { MenuOperation, TransAccount } from "../../transfer/models/operation.models";

export interface TableObj {
  valor: number,
  data: string,
  descricao: string,
  recebedor: TransAccount | null,
  tipo: MenuOperation
}