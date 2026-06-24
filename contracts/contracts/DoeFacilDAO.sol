// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";

// Interface minima do DoeFacil: a DAO so precisa verificar ONGs.
interface IDoeFacil {
    function verificar_ong(address carteira) external;
}

// DAO de governanca por tokens que decide, por votacao, quais ONGs sao
// verificadas no DoeFacil. O peso do voto vem de um snapshot (getPastVotes no
// bloco de criacao da proposta), o que impede transferir tokens para votar de
// novo. Ao aprovar, a propria DAO chama verificar_ong (e dona do DoeFacil).
contract DoeFacilDAO {
    enum Estado { Ativa, Aprovada, Rejeitada, Executada }

    struct Proposta {
        uint256 id;
        address proponente;
        address ongAlvo;
        string descricao;
        uint256 criadaEmBloco;
        uint256 fim;
        uint256 votosFavor;
        uint256 votosContra;
        bool executada;
    }

    IVotes public immutable token;
    IDoeFacil public immutable doeFacil;
    uint256 public immutable votingPeriod;
    uint256 public immutable quorumPercent;
    uint256 public immutable proposalThreshold;

    mapping(uint256 => Proposta) public propostas;
    mapping(uint256 => mapping(address => bool)) public jaVotou;
    uint256 public contadorPropostas;

    event PropostaCriada(
        uint256 indexed id,
        address indexed proponente,
        address indexed ongAlvo,
        uint256 fim
    );
    event Votou(uint256 indexed id, address indexed eleitor, bool apoia, uint256 peso);
    event PropostaExecutada(uint256 indexed id, address indexed ongAlvo);

    constructor(
        IVotes _token,
        IDoeFacil _doeFacil,
        uint256 _votingPeriod,
        uint256 _quorumPercent,
        uint256 _proposalThreshold
    ) {
        require(_quorumPercent <= 100, "Quorum invalido");
        token = _token;
        doeFacil = _doeFacil;
        votingPeriod = _votingPeriod;
        quorumPercent = _quorumPercent;
        proposalThreshold = _proposalThreshold;
    }

    function criarProposta(address ongAlvo, string calldata descricao)
        external
        returns (uint256)
    {
        require(ongAlvo != address(0), "ONG alvo invalida");
        require(
            token.getVotes(msg.sender) >= proposalThreshold,
            "Poder de voto insuficiente para propor"
        );

        contadorPropostas++;
        uint256 id = contadorPropostas;

        propostas[id] = Proposta({
            id: id,
            proponente: msg.sender,
            ongAlvo: ongAlvo,
            descricao: descricao,
            criadaEmBloco: block.number,
            fim: block.timestamp + votingPeriod,
            votosFavor: 0,
            votosContra: 0,
            executada: false
        });

        emit PropostaCriada(id, msg.sender, ongAlvo, propostas[id].fim);
        return id;
    }

    function votar(uint256 id, bool apoia) external {
        Proposta storage p = propostas[id];
        require(p.id != 0, "Proposta inexistente");
        require(block.timestamp <= p.fim, "Votacao encerrada");
        require(!jaVotou[id][msg.sender], "Ja votou nesta proposta");

        uint256 peso = token.getPastVotes(msg.sender, p.criadaEmBloco);
        require(peso > 0, "Sem poder de voto no snapshot");

        jaVotou[id][msg.sender] = true;
        if (apoia) {
            p.votosFavor += peso;
        } else {
            p.votosContra += peso;
        }

        emit Votou(id, msg.sender, apoia, peso);
    }
}
