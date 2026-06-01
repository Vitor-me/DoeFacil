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
        uint256 meta_arreacadacao;
        uint256 total_arrecadado;
        uint256 prazo;
        bool ativa;
    }

    mapping(address => ONG) public ongs;

    mapping(uint256 => Campanha) public campanhas;

    mapping(uint256 => mapping(address => bool)) public fornecedores_autorizados;

    event ong_verificada(address indexed carteira);
    event campanha_criada(uint256 indexed id, string titulo, uint256 meta);
    event doacao_recebida(uint256 indexed campanhaID, address indexed doador, uint256 valor);

    constructor() Ownable(msg.sender) {}

    function verificar_ong(address _carteira) external onlyOwner {
        // Lógica e emissão do evento ong_verificada serão feitas na Sprint 2
    }

    function criar_campanha(string memory _titulo, uint256 _meta, uint256 _prazo) external {
        // Lógica e emissão do evento campanha_criada serão feitas na Sprint 2
    }
    
    function doar(uint256 _campanhaID) external payable nonReentrant {
        // Lógica e emissão do evento doacao_recebida serão feitas na Sprint 2
    }

    function autorizar_fornecedor(uint256 _campanhaID, address _fornecedor) external {
        // Lógica será feita na Sprint 3
    }

    function sacar(uint256 _campanhaID, uint256 _valor, address payable _fornecedor) external nonReentrant {
        // Lógica será feita na Sprint 3
    }
}
