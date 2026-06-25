// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token de governanca da DoeFacil DAO.
// Usa ERC20Votes para registrar checkpoints do poder de voto por bloco, o que
// permite consultar o poder de voto historico (getPastVotes) e impedir o
// voto-duplo por transferencia de tokens. O owner (deployer) distribui tokens
// aos membros; cada membro precisa chamar delegate(proprio endereco) uma vez
// para ativar seu poder de voto.
contract GovToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor()
        ERC20("DoeFacil Governance", "DFG")
        ERC20Permit("DoeFacil Governance")
        Ownable(msg.sender)
    {}

    function mint(address para, uint256 quantidade) external onlyOwner {
        _mint(para, quantidade);
    }

    // Overrides exigidos pela combinacao ERC20 + ERC20Votes + ERC20Permit.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address dono)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(dono);
    }
}
