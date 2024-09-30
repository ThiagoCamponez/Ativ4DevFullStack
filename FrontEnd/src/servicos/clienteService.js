export async function buscarTodosClientes(token){
    
    const resposta = await fetch("http://localhost:4000/cliente",
        {
            method: "GET",
            headers: {
                "Authorization": token
            },
            credentials: 'include'
        }
    );
    return await resposta.json();
}