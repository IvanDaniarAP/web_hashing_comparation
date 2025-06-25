const hre = require("hardhat");

async function main() {
  console.log("Deploying MyTestUSD contract...");

  const MyTestUSD = await hre.ethers.getContractFactory("MyTestUSD");
  const myTestUSD = await MyTestUSD.deploy();

  await myTestUSD.waitForDeployment();

  const contractAddress = await myTestUSD.getAddress();
  console.log("MyTestUSD deployed to:", contractAddress);

  // Save contract address and ABI
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    abi: MyTestUSD.interface.format('json')
  };

  fs.writeFileSync(
    './src/contracts/MyTestUSD.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to src/contracts/MyTestUSD.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });