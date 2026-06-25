// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Contrato auxiliar de TESTE (nao deve ser publicado em producao).
//
// Simula um fornecedor malicioso: ao receber o ETH do `sacar`, tenta reentrar
// imediatamente na mesma funcao para drenar a campanha. Serve para provar, via
// teste, que o `sacar` do DoeFacil e seguro contra reentrancia (protegido por
// `nonReentrant` + padrao Checks-Effects-Interactions).

interface IDoeFacil {
    function sacar(uint256 campanhaID, uint256 valor, address payable fornecedor) external;
}

contract AtacanteReentrancia {
    IDoeFacil public immutable alvo;
    uint256 public campanhaID;
    uint256 public valor;

    // Telemetria observada pelo teste.
    uint256 public tentativasReentrada;
    bool public reentradaBloqueada;

    constructor(address _alvo) {
        alvo = IDoeFacil(_alvo);
    }

    // Define qual campanha/valor a reentrada vai tentar sacar de novo.
    function configurar(uint256 _campanhaID, uint256 _valor) external {
        campanhaID = _campanhaID;
        valor = _valor;
    }

    // Disparado quando o DoeFacil envia o ETH do saque para este contrato.
    receive() external payable {
        tentativasReentrada++;
        // Tenta sacar novamente no meio da primeira chamada. Se o contrato for
        // seguro, esta reentrada reverte e o catch marca o bloqueio — sem
        // derrubar o saque legitimo em andamento.
        try alvo.sacar(campanhaID, valor, payable(address(this))) {
            // Se cair aqui, a reentrada NAO foi bloqueada (falha de seguranca).
            reentradaBloqueada = false;
        } catch {
            reentradaBloqueada = true;
        }
    }
}
