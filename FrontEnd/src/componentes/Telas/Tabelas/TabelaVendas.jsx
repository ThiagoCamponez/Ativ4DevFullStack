import { Button, Container, Table } from "react-bootstrap";
import { useContext } from "react";
import { ContextoUsuarioLogado } from "../../../App";
import { excluir } from "../../../servicos/pedidoService";

export default function TabelaVendas(props) {
    const contextoUsuario = useContext(ContextoUsuarioLogado);

    // Renomeando a função para evitar conflito
    function handleExcluirVenda(venda) {
        const token = contextoUsuario.usuarioLogado.token;
        if (window.confirm(`Deseja excluir a venda do cliente ${venda.cliente.nome}?`)) {
            excluir(venda, token) // Usar a função importada renomeada
            .then((resposta) => {
                props.setAtualizarTela(true); // Garantir que a tela seja atualizada
                alert(resposta.mensagem);
            }).catch((erro) => {
                alert("Erro ao enviar a requisição: " + erro.message);
            });
        }
    }

    return (
        <Container>
            <Button className="mb-3" variant="primary"
                onClick={() => {
                    props.setExibirTabela(false);
                }}>
                Adicionar Venda
            </Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Data da Venda</th>
                        <th>Total da Venda</th>
                        <th>Qtd. de itens vendidos</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                {
                    props.listaDeVendas?.map((venda) => {
                        return (
                            <tr key={venda.codigo}>
                                <td>{venda.codigo}</td>
                                <td>{venda.cliente.nome}</td>
                                <td>{venda.data}</td>
                                <td>{venda.total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                                <td>{venda.produtos.length}</td>
                                <td>
                                    <Button variant="warning">
                                        Alterar
                                    </Button>{' '}
                                    <Button variant="danger"
                                        onClick={() => handleExcluirVenda(venda)}>
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </Table>
        </Container>
    );
}
