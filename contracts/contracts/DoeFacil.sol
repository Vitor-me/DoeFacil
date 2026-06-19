// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importação dos contratos padrão de segurança
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DoeFacil is Ownable, ReentrancyGuard {
    struct ONG {
        address carteira;
        string nome;
        bool verificada;
    }

    struct Campanha {
        uint256 id;
        address ong;
        string titulo;
        uint256 meta_arrecadacao;
        uint256 total_arrecadado;
        uint256 prazo;
        bool ativa;
    }

    mapping(address => ONG) public ongs;
    mapping(uint256 => Campanha) public campanhas;
    mapping(uint256 => mapping(address => bool)) public fornecedores_autorizados;

    uint256 public contadorCampanhas;

    event ong_verificada(address indexed carteira);
    event campanha_criada(uint256 indexed id, string titulo, uint256 meta);
    event doacao_recebida(uint256 indexed campanhaID, address indexed doador, uint256 valor);

    constructor() Ownable(msg.sender) {}

    function verificar_ong(address _carteira) external onlyOwner {
        ongs[_carteira].verificada = true;

        emit ong_verificada(_carteira);
    }

    function criar_campanha(string memory _titulo, uint256 _meta, uint256 _prazo) external {
        require(ongs[msg.sender].verificada, "Somente ONGs verificadas podem criar campanhas");
        require(_meta > 0, "A meta deve ser maior que zero");
        require(_prazo > block.timestamp, "O prazo deve ser uma data no futuro");

        contadorCampanhas++;
        uint256 novoID = contadorCampanhas;

        campanhas[novoID] = Campanha({
            id: novoID,
            ong: msg.sender,
            titulo: _titulo,
            meta_arrecadacao: _meta,
            total_arrecadado: 0,
            prazo: _prazo,
            ativa: true
        });

        emit campanha_criada(novoID, _titulo, _meta);   
    }
    
    function doar(uint256 _campanhaID) external payable nonReentrant {
        Campanha storage campanha = campanhas[_campanhaID];

        require(campanha.ativa, "Esta campanha nao esta ativa");
        require(block.timestamp <= campanha.prazo, "O prazo da campanha ja encerrou");
        require(msg.value > 0, "O valor da doacao deve ser maior que zero");

        campanha.total_arrecadado += msg.value;

        emit doacao_recebida(_campanhaID, msg.sender, msg.value);
    }

    function autorizar_fornecedor(uint256 _campanhaID, address _fornecedor) external {
        // Lógica será feita na Sprint 3
    }

    function sacar(uint256 _campanhaID, uint256 _valor, address payable _fornecedor) external nonReentrant {
        // Lógica será feita na Sprint 3
    }
}
