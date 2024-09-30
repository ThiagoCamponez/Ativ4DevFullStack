import { useState, useEffect, useContext } from "react";
import { Form, Row, Col, Button, Container } from 'react-bootstrap';
import BarraBusca from "../../busca/BarraBusca";
import CaixaSelecao from "../../busca/CaixaSelecao";
import TabelaItensVenda from "../Tabelas/TabelaItensVenda";
import {buscarTodosClientes} from "../../../servicos/clienteService";
import {ContextoUsuarioLogado} from "../../../App";
import { gravarPedido } from "../../../servicos/pedidoService";
export default function FormCadVenda(props) {
    const contextoUsuario = useContext(ContextoUsuarioLogado);
    const [validado, setValidado] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [clienteSelecionado, setClienteSelecionado] = useState({});
    const [itemSelecionado, setItemSelecionado] = useState({});
    const [quantidade, setQuantidade] = useState(1);
    const [subTotal, setSubTotal] = useState(0.00);

    useEffect(() => {
        const token = contextoUsuario.usuarioLogado.token;
        buscarTodosClientes(token).then((resposta) => {
            if (resposta.status) {
                setClientes(resposta.listaClientes);
            }
        })
    }, []); //didMount

   
    const dataAtual = new Date();

     //O estado venda possui correlação com a venda gerenciada no backend
    const [venda, setVenda] = useState({
        codigo: 0,
        dataPedido: dataAtual.toISOString().substring(0, 10),
        totalPedido: 0,
        cliente: {},
        itens: []
    });

    
    function manipularMudanca(e) {
        const alvo = e.target.name;
        if (e.target.type === "checkbox") {
            setVenda({ ...venda, [alvo]: e.target.checked });
        }
        else {
            setVenda({ ...venda, [alvo]: e.target.value });
        }
    }

    
    const manipulaSubmissao = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity()) {
            const token = contextoUsuario.usuarioLogado.token;
            gravarPedido(venda, token).then((resposta) => {
                if(resposta.status){
                    alert(resposta.mensagem + "Nº do pedido: " + resposta.codigo);
                    props.setExibirTabela(true);
                }
                else{
                    alert(resposta.mensagem);
                }
            }).catch((erro) => {
                alert(erro.message);
            });
            setValidado(false);
        }
        else {
            setValidado(true);
        }
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <Form noValidate validated={validado} onSubmit={manipulaSubmissao}>
            <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="idVenda">
                    <Form.Label>Pedido nº</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        placeholder="0"
                        defaultValue="0"
                        disabled
                        name="id"
                        value={venda.id}
                        onChange={manipularMudanca}
                    />
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="dataVenda">
                    <Form.Label>Data do Pedido</Form.Label>
                    <Form.Control
                        type="date"
                        required
                        name="dataPedido"
                        value={venda.dataPedido}
                        onChange={manipularMudanca}
                    />
                    <Form.Control.Feedback type="invalid">
                        Por favor informe a data da venda.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="3" controlId="desconto">
                    <Form.Label>Total do Pedido</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="0,00"
                        value={venda.totalPedido}
                        name="totalPedido"
                        onChange={manipularMudanca}
                        required
                        disabled />
                    <Form.Control.Feedback type="invalid">
                        Por favor, informe o valor total do pedido
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} md="12" controlId="valorTotalTributos">
                    <Form.Label>Cliente:</Form.Label>
                    <BarraBusca campoBusca={"nome"}
                        campoChave={"cpf"}
                        dados={clientes}
                        funcaoSelecao={(cliente) =>{
                            setClienteSelecionado(cliente);
                            setVenda({...venda, cliente: cliente});
                        }}
                        placeHolder={"Selecione um cliente"}
                        valor={""} />
                </Form.Group>
            </Row>
            <Row>
                {
                    //Seção resposável por permitir que produtos sejam selecionados para a venda
                    //Demonstração de relacionamento muitos para muitos
                }
                <Container className="m-3 border">
                    <Row className="m-3">
                        <Col md={2}>
                            <Form.Label>Selecione um produto</Form.Label>
                        </Col>
                        <Col>
                            <CaixaSelecao enderecoFonteDados={"http://localhost:4000/produto"}
                                campoChave={"codigo"}
                                campoExibicao={"descricao"}
                                funcaoSelecao={(item) => {
                                    setItemSelecionado(item);
                                    setQuantidade(1);
                                    setSubTotal(item.precoVenda);
                                }}
                                localLista={'listaProdutos'} 
                                tokenAcesso={contextoUsuario.usuarioLogado.token}/>
                        </Col>
                    </Row>
                    <Row>
                        {
                            //Seção ficará responsável por detalhar o produto selecionado
                        }
                        <Col md={10}>
                            <Row>
                                <Col md={1}>
                                    <Form.Group>
                                        <Form.Label>Código:</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            disabled 
                                            value={itemSelecionado?.codigo}//Faz aparecer o código do item selecionado
                                            />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Descrição do Produto:</Form.Label>
                                        <Form.Control 
                                        type="text" 
                                        disabled 
                                        value={itemSelecionado?.descricao}/>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Preço R$:</Form.Label>
                                        <Form.Control 
                                        type="text" 
                                        disabled 
                                        value={itemSelecionado?.precoVenda}/>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Qtd</Form.Label>
                                        <Form.Control type="number"
                                            min={1}
                                            value={quantidade}
                                            onChange={(evento) => {
                                                const qtd = parseInt(evento.target.value);
                                                if (qtd > 0){
                                                    setQuantidade(qtd);
                                                    if (itemSelecionado) {
                                                        setSubTotal(itemSelecionado.precoVenda * qtd);
                                                    }
                                                }
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>SubTotal</Form.Label>
                                        <Form.Control 
                                        type="text" 
                                        disabled 
                                        value={Number(subTotal).toFixed(2)}/>
                                    </Form.Group>
                                </Col>
                                <Col md={1} className="middle">
                                    <Form.Group>
                                        <Form.Label>Adicionar</Form.Label>
                                        <Button onClick={() => {
                                            if (itemSelecionado) {
                                                const subTotalFormatado = parseFloat(subTotal).toFixed(2);
                                                setVenda({...venda, itens: [...venda.itens, {
                                                    "codigo": itemSelecionado.codigo, 
                                                    "descricao": itemSelecionado.descricao, 
                                                    "precoUnitario": itemSelecionado.precoVenda, 
                                                    "quantidade": quantidade, 
                                                    "subtotal": subTotalFormatado
                                                }],
                                                "totalPedido": (parseFloat(venda.totalPedido) + parseFloat(subTotal)).toFixed(2) });
                                            } 
                                            
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-bag-plus-fill"
                                                viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5v-.5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0zM8.5 8a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V12a.5.5 0 0 0 1 0v-1.5H10a.5.5 0 0 0 0-1H8.5V8z" />
                                            </svg>
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <p><strong>Lista de produtos escolhidos</strong></p>
                        <TabelaItensVenda
                            listaItens={venda.itens}
                            setVenda={setVenda}
                            dadosVenda={venda} />
                    </Row>
                </Container>
            </Row>
            <Button type="submit">Confirmar a Venda</Button> <Button variant="secondary" 
                                                                     onClick={
                                                                        () => props.setExibirTabela(true)
                                                                    }>Cancelar</Button>
        </Form>
    );
}