const Token = artifacts.require("./FixedSupplyToken.sol");

module.exports = function (deployer) {
  deployer.deploy(Token);
}