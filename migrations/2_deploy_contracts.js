const FixedSupply = artifacts.require("./ERC20FixedSupply.sol");
const Mintable = artifacts.require("./ERC20MintableWithInitialSupply.sol");

module.exports = function (deployer) {
  deployer.deploy(FixedSupply);
  deployer.deploy(Mintable);
};