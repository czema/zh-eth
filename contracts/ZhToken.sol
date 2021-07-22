// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./Interfaces.sol";
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';


contract ZhToken is ERC20 {
	using SafeERC20 for IERC20;
	using Address for address;
	using SafeMath for uint256;
	
	address public operator;
	address public veepsProxy;
	
	uint256 public maxSupply = 100 * 1000000 * 1e18; //100mil
	uint256 public totalCliffs = 1000;
	uint256 public reductionPerCliff;
	
	constructor (address _proxy)
		ERC20 (
			"Zh Token",
			"ZH"
		)
	{                                                  
		operator = msg.sender;
		veepsProxy = _proxy;
		reductionPerCliff = maxSupply.div(totalCliffs);
	}
	
	// Use the operator on the proxy.
	function updateOperator() public {
		operator = IStaker(veepsProxy).operator();
	}
	
	function mint(address _to, uint256 _amount) external {
		if (msg.sender != operator) {
			// `mint` can be called successfully by others, it just won't actually mint.
			return;
		}
		
		uint256 supply = totalSupply();
		if (supply == 0) {
			// Premine, one time only.
			_mint(_to, _amount);
			
			// Switch operators.
			updateOperator();
			return;			
		}
		
		// Use current supply to gauge cliff.  This will cause a bit of overflow into the next cliff.
		// Requires a max supply check.
		uint256 cliff = supply.div(reductionPerCliff);
		
		// Mint if below total cliffs.
		if (cliff < totalCliffs) {
			// For reduction pct take inverse of current cliff.
			uint256 reduction = totalCliffs.sub(cliff);
			
			// Reduce
			_amount = _amount.mul(reduction).div(totalCliffs);
			
			// Do not exceed supply.
			uint256 cap = maxSupply.sub(supply);
			if (_amount > cap) {
				_amount = cap;
			}
			
			// Mint
			_mint(_to, _amount);
		}
	}
}