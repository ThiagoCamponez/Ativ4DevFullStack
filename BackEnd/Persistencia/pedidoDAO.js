import Pedido from "../Modelo/pedido.js";
import Cliente from "../Modelo/cliente.js";
import Categoria from "../Modelo/categoria.js";
import Produto from "../Modelo/produto.js";
import ItemPedido from "../Modelo/itemPedido.js";
import conectar from "./conexao.js";

export default class PedidoDao {
    async gravar(pedido) {
        //um pedido no banco de dados grava registro na tabela pedido e também na tabela pedido_produto
        if (pedido instanceof Pedido) {
            const conexao = await conectar();
            //garantir a transação das operações para que seja realizada de forma atômica
            await conexao.beginTransaction();
            try {
                //inserir na tabela pedido
                const sql = 'INSERT INTO pedido(cliente_codigo, data_pedido, total) VALUES(?,str_to_date(?,"%d/%m/%Y"),?)';
                const parametros = [pedido.cliente.cpf, pedido.data, pedido.total];
                const retorno = await conexao.execute(sql, parametros);
                pedido.codigo = retorno[0].insertId;
                //inserir na tabela item pedido
                const sql2 = 'INSERT INTO pedido_produto(pedido_codigo, produto_codigo, quantidade, preco_unitario) VALUES(?,?,?,?)';
                for (const item of pedido.itens) {
                    let parametros2 = [pedido.codigo, item.produto.codigo, item.quantidade, item.precoUnitario];
                    await conexao.execute(sql2, parametros2);
                }
                await conexao.commit(); //se chegou até aqui sem erros, confirmaremos as inclusões
                global.poolConexoes.releaseConnection(conexao);
            }
            catch (error) {
                await conexao.rollback(); //voltar o banco de dados ao estado anterior
                throw error; //throw = lançar
            }
        }

    }

    async alterar(pedido) {

    }

    async excluir(pedido) {
        const conexao = await conectar();
        try {
            await conexao.beginTransaction();
    
            // Excluir primeiro os itens relacionados na tabela pedido_produto
            const sql1 = 'DELETE FROM pedido_produto WHERE pedido_codigo = ?';
            await conexao.execute(sql1, [pedido.codigo]);
    
            // Excluir o pedido na tabela pedido
            const sql2 = 'DELETE FROM pedido WHERE codigo = ?';
            await conexao.execute(sql2, [pedido.codigo]);
    
            await conexao.commit();
            global.poolConexoes.releaseConnection(conexao);
    
        } catch (error) {
            await conexao.rollback(); // Desfazer as operações caso haja erro
            global.poolConexoes.releaseConnection(conexao);
            throw error;
        }
    }
    

    async consultar(termoBusca) {
        const listaPedidos = [];
        const conexao = await conectar();
        let sql = "";
        let parametros = [];
        
        if (!isNaN(termoBusca)) { // Assegurando que seja um código de pedido do tipo inteiro
            sql = `SELECT p.codigo, p.cliente_codigo, p.data_pedido, p.total,
                        c.nome, c.endereco, c.telefone,
                        prod.prod_descricao, prod.prod_precoCusto, prod.prod_precoVenda, prod.prod_dataValidade, prod.prod_qtdEstoque,
                        cat.cat_codigo, cat.cat_descricao,
                        i.produto_codigo, i.quantidade, i.preco_unitario, i.quantidade * i.preco_unitario as subtotal
                    FROM pedido as p
                    INNER JOIN cliente as c ON p.cliente_codigo = c.cpf
                    INNER JOIN pedido_produto as i ON i.pedido_codigo = p.codigo
                    INNER JOIN produto as prod ON prod.prod_codigo = i.produto_codigo
                    INNER JOIN categoria as cat ON prod.cat_codigo = cat.cat_codigo
                    WHERE p.codigo = ?`;
            parametros = [termoBusca];
        } else {
            sql = `SELECT p.codigo, p.cliente_codigo, p.data_pedido, p.total,
                        c.nome, c.endereco, c.telefone,
                        prod.prod_descricao, prod.prod_precoCusto, prod.prod_precoVenda, prod.prod_dataValidade, prod.prod_qtdEstoque,
                        cat.cat_codigo, cat.cat_descricao,
                        i.produto_codigo, i.quantidade, i.preco_unitario, i.quantidade * i.preco_unitario as subtotal
                    FROM pedido as p
                    INNER JOIN cliente as c ON p.cliente_codigo = c.cpf
                    INNER JOIN pedido_produto as i ON i.pedido_codigo = p.codigo
                    INNER JOIN produto as prod ON prod.prod_codigo = i.produto_codigo
                    INNER JOIN categoria as cat ON prod.cat_codigo = cat.cat_codigo
                    ORDER BY p.codigo`; // Adicionando ORDER BY para garantir a ordem dos pedidos
        }
    
        const [registros] = await conexao.execute(sql, parametros);
        global.poolConexoes.releaseConnection(conexao);
    
        if (registros.length > 0) {
            let pedidoAtual = null;
    
            for (const registro of registros) {
                // Verifica se já estamos tratando o pedido atual
                if (!pedidoAtual || pedidoAtual.codigo !== registro.codigo) {
                    // Cria um novo pedido, se o pedido atual for diferente ou nulo
                    const cliente = new Cliente(
                        registro.cliente_codigo, 
                        registro.nome, 
                        registro.telefone, 
                        registro.endereco
                    );
    
                    pedidoAtual = new Pedido(
                        registro.codigo, 
                        cliente, 
                        new Date(registro.data_pedido).toLocaleDateString('pt-BR'),
                        registro.total, 
                        []
                    );
    
                    listaPedidos.push(pedidoAtual); // Adiciona o novo pedido à lista
                }
    
                // Adiciona os itens ao pedido atual
                const categoria = new Categoria(registro.cat_codigo, registro.cat_descricao);
                const produto = new Produto(
                    registro.produto_codigo, 
                    registro.prod_descricao, 
                    registro.prod_precoCusto, 
                    registro.prod_precoVenda, 
                    registro.prod_dataValidade, 
                    registro.prod_qtdEstoque, 
                    categoria
                );
    
                const itemPedido = new ItemPedido(
                    produto, 
                    registro.quantidade, 
                    registro.preco_unitario, 
                    registro.subtotal
                );
    
                pedidoAtual.itens.push(itemPedido); // Adiciona o item ao pedido atual
            }
        }
    
        return listaPedidos;
    }
    
}