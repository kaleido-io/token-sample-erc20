pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ERC20MintableWithInitialSupply is ERC20Mintable, ERC20Detailed, Ownable {
  constructor()
    Ownable()
    ERC20Detailed("Example ERC20 Token With Initial Supply Of 1 Million And Mintable", "Mintable", 18)
    ERC20Mintable()
    public {
    _mint(super.owner(), 1000000 * 10**uint(super.decimals()));
  }
}