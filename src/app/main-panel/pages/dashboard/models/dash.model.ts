import { MenuOperation, TransAccount } from "../../transfer/models/operation.models";

export interface TableObj {
  valor: number,
  data: string,
  descricao: string,
  recebedor: TransAccount | null,
  tipo: MenuOperation
}

export interface CardDocuments extends TableObj {
  classCard: string,
  id: string,
}

export interface ListDocuments extends CardDocuments {
  pago: boolean;
}