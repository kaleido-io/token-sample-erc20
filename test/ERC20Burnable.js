let TokenContract = artifacts.require('ERC20BurnableWithInitialSupply');

const truffleAssert = require('truffle-assertions');

contract("Burnable Tokens", async (accounts) => {
  const TotalSupply = '1000000000000000000000000';
  let myContract, currentOwner, spender, user1;

  before(() => {
    currentOwner = accounts[0];
    spender = accounts[1];
    user1 = accounts[2];
  });

  describe("constructor", async() => {
    it("initialized with the correct supply", async() => {
      myContract = await TokenContract.new();
      let supply = await myContract.totalSupply();
      // one million with 18 decimals
      expect(supply.toString()).to.equal(TotalSupply);

      const transactionHash = myContract.transactionHash;
    
      const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
      const blockNumber = transactionReceipt.blockNumber;

      const eventList = await myContract.getPastEvents("allEvents", {fromBlock: blockNumber, toBlock: blockNumber});
      const events = eventList.filter(ev => ev.transactionHash === transactionHash);
      expect(events.length).to.equal(2); // OwnershipTransferred by Ownable, and Transfer by ERC20
      expect(events[1].args.value.toString()).to.equal(TotalSupply);

      currentOwner = events[1].args.to;
    });

    it("check the contract deployer is the new owner and has all the money", async () => {
      let ownerBalance = await myContract.balanceOf(currentOwner);
      expect(ownerBalance.toString()).to.equal(TotalSupply);
    });
  });

  describe('adding spenders that can transfer money on behalf of the token owner', () => {
    it('current owner approves a new account to be the spender', async () => {
      let result = await myContract.approve(spender, 1000000);

      truffleAssert.eventEmitted(result, 'Approval', ev => {
        return ev.owner === currentOwner && ev.spender === spender;
      }, `Add allowance to ${spender}`);

      let allowance = await myContract.allowance(currentOwner, spender);
      expect(allowance.toString()).to.equal('1000000');
    });
  });

  describe('transfer', () => {
    it('current owner transfers to the spender', async () => {
      let result = await myContract.transfer(spender, 1000);

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === currentOwner && ev.to === spender;
      }, `Transfer to ${spender}`);

      let balance = await myContract.balanceOf(spender);
      expect(balance.toString()).to.equal('1000');
    });

    it('spender transfers from its own pocket to user1', async () => {
      let result = await myContract.transfer(user1, 500, { from: spender });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === spender && ev.to === user1;
      }, `Transfer to ${user1}`);

      let balance = await myContract.balanceOf(user1);
      expect(balance.toString()).to.equal('500');
      balance = await myContract.balanceOf(spender);
      expect(balance.toString()).to.equal('500');
    });

    it('spender transfers from the custody account to user1', async () => {
      let result = await myContract.transferFrom(currentOwner, user1, 500, { from: spender });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === currentOwner && ev.to === user1;
      }, `Transfer to ${user1}`);

      let balance = await myContract.balanceOf(user1);
      expect(balance.toString()).to.equal('1000');
      balance = await myContract.balanceOf(spender);
      expect(balance.toString()).to.equal('500');
      balance = await myContract.balanceOf(currentOwner);
      expect(balance.toString()).to.equal('999999999999999999998500');
    });
  });

  describe('burn baby burn!', () => {
    it('current owner can burn tokens', async () => {
      let result = await myContract.burn(1000);

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === currentOwner && ev.to === '0x0000000000000000000000000000000000000000';
      }, `Burn my own tokens`);

      let balance = await myContract.balanceOf(currentOwner);
      expect(balance.toString()).to.equal('999999999999999999997500');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('999999999999999999999000');
    });

    it('spender can also burn its own tokens', async () => {
      let result = await myContract.burn(100, { from: spender });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === spender && ev.to === '0x0000000000000000000000000000000000000000';
      }, `Burn my own tokens`);

      let balance = await myContract.balanceOf(spender);
      expect(balance.toString()).to.equal('400');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('999999999999999999998900');
    });

    it('spender can also burn tokens from its allowance', async () => {
      let result = await myContract.burnFrom(currentOwner, 500, { from: spender });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === currentOwner && ev.to === '0x0000000000000000000000000000000000000000';
      }, `Burn allowed tokens`);

      let balance = await myContract.balanceOf(spender);
      expect(balance.toString()).to.equal('400'); // stays the same since spender didn't burn its own tokens
      balance = await myContract.balanceOf(currentOwner);
      expect(balance.toString()).to.equal('999999999999999999997000');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('999999999999999999998400');
    });
  });
});