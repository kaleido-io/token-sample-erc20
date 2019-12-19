# token-sample-erc20

The purpose of this sample project is demonstrating [ERC20 token](https://eips.ethereum.org/EIPS/eip-20) contracts based on the awesome openzeppelin contract library, and features of the ERC20 token specification with truffel test scenarios.

## Token Contracts Demonstrated

The contracts with the features and tested scenarios are listed below.

#### Fixed Supply
```
contracts/ERC20FixedSupply.sol

constructor
  ✓ initialized with the correct supply (118ms)
  ✓ check the contract deployer is the new owner and has all the money (45ms)
adding spenders that can transfer money on behalf of the token owner
  ✓ current owner approves a new account to be the spender (60ms)
transfer
  ✓ current owner transfers to the spender (131ms)
  ✓ spender transfers from its own pocket to user1 (81ms)
  ✓ spender transfers from the custody account to user1 (109ms)
```

#### Mintable
```
contracts/ERC20MintableWithInitialSupply.sol

constructor
  ✓ initialized with the correct supply (144ms)
  ✓ check the contract deployer is the new owner and has all the money
adding spenders that can transfer money on behalf of the token owner
  ✓ current owner approves a new account to be the spender (50ms)
transfer
  ✓ current owner transfers to the spender (49ms)
  ✓ spender transfers from its own pocket to user1 (75ms)
  ✓ spender transfers from the custody account to user1 (96ms)
minters
  ✓ current owner is by default a minter and can mint more tokens out of thin air (60ms)
  ✓ current owner can add a new minter (60ms)
  ✓ a minter can make tokens as well (69ms)
  ✓ an altruistic minter can make tokens and give it to user1 (89ms)
```

#### Burnable
```
contracts/ERC20BurnableWithInitialSupply.sol

constructor
  ✓ initialized with the correct supply (109ms)
  ✓ check the contract deployer is the new owner and has all the money
adding spenders that can transfer money on behalf of the token owner
  ✓ current owner approves a new account to be the spender (92ms)
transfer
  ✓ current owner transfers to the spender (61ms)
  ✓ spender transfers from its own pocket to user1 (119ms)
  ✓ spender transfers from the custody account to user1 (164ms)
burn baby burn!
  ✓ current owner can burn tokens (117ms)
  ✓ spender can also burn its own tokens (84ms)
  ✓ spender can also burn tokens from its allowance (104ms)
```

## Getting Started

Instal [truffle](https://truffleframework.com/truffle)

Install [Ganache](https://truffleframework.com/ganache) and start it

```
npm i
truffle test
``` 