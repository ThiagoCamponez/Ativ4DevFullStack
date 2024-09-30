import { Router } from "express";
import PedidoCtrl from "../Controle/pedidoCtrl.js";

const rotaPedido = new Router();
const pedidoCtrl = new PedidoCtrl();

rotaPedido
    .get('/', pedidoCtrl.consultar)
    .get('/:termo', pedidoCtrl.consultar)
    .post('/', pedidoCtrl.gravar)
    //.patch('/', pedidoCtrl.atualizar)
    //.put('/', pedidoCtrl.atualizar)
    .delete('/:id', pedidoCtrl.excluir); // Ajuste aqui para passar o ID do pedido na URL

export default rotaPedido;
