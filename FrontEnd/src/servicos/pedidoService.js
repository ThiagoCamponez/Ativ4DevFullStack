const urlBase = "http://localhost:4000/pedido";

export async function gravarPedido(pedido, token) {
    const resposta = await fetch(urlBase, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        credentials: 'include',
        body: JSON.stringify(pedido)
    });
    return await resposta.json();
}

export async function buscaTodosPedidos(token) {
    const resposta = await fetch(urlBase, {
        method: "GET",
        headers: {
            "Authorization": token
        },
        credentials: 'include'
    });
    return await resposta.json();
}

export async function excluir(pedido, token) {
    const resposta = await fetch(`${urlBase}/${pedido.codigo}`, {  // Adiciona o ID na URL
        method: "DELETE",
        headers: {
            "Authorization": token
        },
        credentials: 'include'
    });

    return await resposta.json();
}
