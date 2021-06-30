// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./Interfaces.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract ZhVoterProxy {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public constant minter = address(0x59BA0e5e3Ed37a8dD27F09DCb4dA6604aB1AAd8a); // Generated. zh.fi Token Minter
    address public constant eps = address(0x6F08266Ba9dB65D2feDE6981c44ea83c36814aEB);
    
    address public constant escrow = address(0x716cc8E16F8bDdC48bC7220E419ffa5FB27CF08E); // Generated. veEPS (Voter-escrowed EPS)
    address public constant gaugeController = address(0x85b823b44Fea82DDB683B3eea4AD5f389BECdb03); // Generated. zh.fi Gauge Controller

	address public owner;
	address public operator;
	address public depositor;
	
	mapping (address => bool) private stashPool;
	mapping (address => bool) private protectedTokens;
	
	constructor() public {
		owner = msg.sender;
	}	                   
	
	function getName() external pure returns (string memory) {
		return "ZhVoterProxy";
	}
	
	function setOwner(address _owner) external {
		require(msg.sender == owner, "!auth");
		
		owner = _owner;
	}                  
	
	function setDepositor(address _depositor) external {
		require(msg.sender == owner, "!auth");
		
		depositor = _depositor;
	}
	
	
}