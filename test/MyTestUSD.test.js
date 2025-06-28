const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyTestUSD", function () {
  let myTestUSD;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const MyTestUSD = await ethers.getContractFactory("MyTestUSD");
    myTestUSD = await MyTestUSD.deploy();
    await myTestUSD.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myTestUSD.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await myTestUSD.name()).to.equal("Stable USD");
      expect(await myTestUSD.symbol()).to.equal("SUSD");
    });

    it("Should have 18 decimals", async function () {
      expect(await myTestUSD.decimals()).to.equal(18);
    });
  });

  describe("User Registration", function () {
    it("Should register user and mint initial supply", async function () {
      const email = "test@example.com";
      
      await myTestUSD.registerUser(email, user1.address);
      
      expect(await myTestUSD.emailToAddress(email)).to.equal(user1.address);
      expect(await myTestUSD.addressToEmail(user1.address)).to.equal(email);
      expect(await myTestUSD.hasReceivedInitialSupply(user1.address)).to.be.true;
      
      const balance = await myTestUSD.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should not allow duplicate email registration", async function () {
      const email = "test@example.com";
      
      await myTestUSD.registerUser(email, user1.address);
      
      await expect(
        myTestUSD.registerUser(email, user2.address)
      ).to.be.revertedWith("Email already registered");
    });
  });

  describe("Transfer by Email", function () {
    beforeEach(async function () {
      await myTestUSD.registerUser("user1@example.com", user1.address);
      await myTestUSD.registerUser("user2@example.com", user2.address);
    });

    it("Should transfer tokens by email", async function () {
      const amount = ethers.parseEther("10");
      const hashMethod = "SHA512";
      const transactionHash = "0x123456789abcdef";
      const executionTime = Math.floor(Date.now() / 1000);

      await myTestUSD.connect(user1).transferByEmail(
        "user2@example.com",
        amount,
        hashMethod,
        transactionHash,
        executionTime
      );

      expect(await myTestUSD.balanceOf(user1.address)).to.equal(ethers.parseEther("90"));
      expect(await myTestUSD.balanceOf(user2.address)).to.equal(ethers.parseEther("110"));
    });

    it("Should emit TransactionWithHash event", async function () {
      const amount = ethers.parseEther("10");
      const hashMethod = "SHA512";
      const transactionHash = "0x123456789abcdef";
      const executionTime = Math.floor(Date.now() / 1000);

      await expect(
        myTestUSD.connect(user1).transferByEmail(
          "user2@example.com",
          amount,
          hashMethod,
          transactionHash,
          executionTime
        )
      ).to.emit(myTestUSD, "TransactionWithHash")
       .withArgs(user1.address, user2.address, amount, hashMethod, transactionHash, executionTime);
    });
  });
});