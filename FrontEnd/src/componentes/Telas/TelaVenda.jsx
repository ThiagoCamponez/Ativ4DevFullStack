import Pagina from "../Templates/Pagina";
import FormCadVenda from "./Formularios/FormCadVenda";
import TabelaVendas from "./Tabelas/TabelaVendas";
import { useState, useEffect, useContext } from "react";
import { buscaTodosPedidos } from "../../servicos/pedidoService";
import { ContextoUsuarioLogado } from "../../App";

export default function TelaVenda(props) {

    const contextoUsuario = useContext(ContextoUsuarioLogado);

    const [exibirTabela, setExibirTabela] = useState(true);
    const [atualizarTela, setAtualizarTela] = useState(false); // Novo estado para atualização da tela
    const [listaDeVendas, setListaDeVendas] = useState([]);

    useEffect(() => {
        const token = contextoUsuario.usuarioLogado.token;
        buscaTodosPedidos(token).then((resposta) => {
            if (resposta.status) {
                setListaDeVendas(resposta.listaPedidos); // Corrigido: status == true
            }
        }).catch((erro) => {
            alert("Erro ao enviar a requisição: " + erro.message);
        });
    }, [exibirTabela, atualizarTela]); // Atualizar a lista quando atualizarTela mudar

    return (
        <Pagina>
            <h1 className="mb-02 text-center">Gestão de Vendas</h1>
            {
                exibirTabela ? 
                <TabelaVendas 
                    exibirTabela={exibirTabela} 
                    setExibirTabela={setExibirTabela}
                    listaDeVendas={listaDeVendas}
                    setAtualizarTela={setAtualizarTela} // Passar prop para atualizar a tela
                /> 
                : 
                <FormCadVenda 
                    exibirTabela={exibirTabela} 
                    setExibirTabela={setExibirTabela}
                    setAtualizarTela={setAtualizarTela} // Passar prop para atualizar a tela após cadastro
                />
            }
        </Pagina>
    );
}
