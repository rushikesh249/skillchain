// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillCredentialRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Credential {
        address student;
        string skillSlug;
        uint256 score;
        string ipfsCid;
        uint256 issuedAt;
        address issuer;
    }

    mapping(uint256 => Credential) public credentials;

    event CredentialMinted(address indexed to, uint256 indexed tokenId, string skillSlug);

    constructor(address initialOwner) ERC721("SkillChain Credential", "SKILL") Ownable(initialOwner) {}

    function issueCredential(
        address student,
        string memory skillSlug,
        uint256 score,
        string memory ipfsCid
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(student, tokenId);
        _setTokenURI(tokenId, ipfsCid); // Using CID as URI for simplicity, or ipfs://<cid>

        credentials[tokenId] = Credential({
            student: student,
            skillSlug: skillSlug,
            score: score,
            ipfsCid: ipfsCid,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });

        emit CredentialMinted(student, tokenId, skillSlug);

        return tokenId;
    }

    function getCredential(uint256 credentialId) public view returns (Credential memory) {
        return credentials[credentialId];
    }

    // Soulbound Token Logic: Prevent transfers
    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("SkillChain: Credentials are soulbound and cannot be transferred");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert("SkillChain: Credentials are soulbound and cannot be transferred");
    }
}
