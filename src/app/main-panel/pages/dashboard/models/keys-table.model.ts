import { MenuOperation } from "../../transfer/models/operation.models";

export interface KeysTable {
  valor: number,
  data: string,
  recebedor: string,
  tipo: MenuOperation
}