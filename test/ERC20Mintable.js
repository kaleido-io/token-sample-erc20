let TokenContract = artifacts.require('ERC20MintableWithInitialSupply');

const truffleAssert = require('truffle-assertions');

contract("Mintable Token", async (accounts) => {
  const InitialSupply = '1000000000000000000000000';
  let myContract, currentOwner, spender, user1, minter;

  before(() => {
    currentOwner = accounts[0];
    spender = accounts[1];
    user1 = accounts[2];
    minter = accounts[3];
  });

  describe("constructor", async() => {
    it("initialized with the correct supply", async() => {
      myContract = await TokenContract.new();
      let supply = await myContract.totalSupply();
      // one million with 18 decimals
      expect(supply.toString()).to.equal(InitialSupply);

      const transactionHash = myContract.transactionHash;
    
      const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);
      const blockNumber = transactionReceipt.blockNumber;

      const eventList = await myContract.getPastEvents("allEvents", {fromBlock: blockNumber, toBlock: blockNumber});
      const events = eventList.filter(ev => ev.transactionHash === transactionHash);
      expect(events.length).to.equal(3); // OwnershipTransferred by Ownable, and Transfer by ERC20, MinterAdded by MinterRole
      expect(events[2].args.value.toString()).to.equal(InitialSupply);

      currentOwner = events[2].args.to;
    });

    it("check the contract deployer is the new owner and has all the money", async () => {
      let ownerBalance = await myContract.balanceOf(currentOwner);
      expect(ownerBalance.toString()).to.equal(InitialSupply);
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

  describe('minters', () => {
    it('current owner is by default a minter and can mint more tokens out of thin air', async () => {
      let result = await myContract.mint(currentOwner, 1000);

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === '0x0000000000000000000000000000000000000000' && ev.to === currentOwner;
      }, `Mint some tokens and give to myself`);

      let balance = await myContract.balanceOf(currentOwner);
      expect(balance.toString()).to.equal('999999999999999999999500');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('1000000000000000000001000');
    });

    it('current owner can add a new minter', async () => {
      let result = await myContract.addMinter(minter);

      truffleAssert.eventEmitted(result, 'MinterAdded', ev => {
        return ev.account === minter;
      }, `Add a minter`);

      let isMinter = await myContract.isMinter(minter);
      expect(isMinter).to.be.true;
    });

    it('a minter can make tokens as well', async () => {
      let result = await myContract.mint(minter, 1000, { from: minter });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === '0x0000000000000000000000000000000000000000' && ev.to === minter;
      }, `Mint some tokens and give to myself`);

      let balance = await myContract.balanceOf(minter);
      expect(balance.toString()).to.equal('1000');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('1000000000000000000002000');
    });

    it('an altruistic minter can make tokens and give it to user1', async () => {
      let result = await myContract.mint(user1, 1000, { from: minter });

      truffleAssert.eventEmitted(result, 'Transfer', ev => {
        return ev.from === '0x0000000000000000000000000000000000000000' && ev.to === user1;
      }, `Mint some tokens and give to user1`);

      let balance = await myContract.balanceOf(minter);
      expect(balance.toString()).to.equal('1000');
      balance = await myContract.balanceOf(user1);
      expect(balance.toString()).to.equal('2000');
      balance = await myContract.totalSupply();
      expect(balance.toString()).to.equal('1000000000000000000003000');
    });
  });
});