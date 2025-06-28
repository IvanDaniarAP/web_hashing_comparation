const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting deployment of MyTestUSD contract...");
  
  // Get the contract factory
  const MyTestUSD = await hre.ethers.getContractFactory("MyTestUSD");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const myTestUSD = await MyTestUSD.deploy();
  
  // Wait for deployment to complete
  await myTestUSD.waitForDeployment();
  
  const contractAddress = await myTestUSD.getAddress();
  console.log("✅ MyTestUSD deployed to:", contractAddress);
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  // Create contract info object
  const contractInfo = {
    address: contractAddress,
    abi: MyTestUSD.interface.formatJson(),
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };
  
  // Ensure directory exists
  const contractsDir = path.join(__dirname, '..', 'src', 'contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Save contract info to JSON file
  const contractPath = path.join(contractsDir, 'MyTestUSD.json');
  fs.writeFileSync(contractPath, JSON.stringify(contractInfo, null, 2));
  
  console.log("💾 Contract info saved to:", contractPath);
  
  // Verify contract on Etherscan (if API key is provided)
  if (process.env.ETHERSCAN_API_KEY && network.name !== "hardhat") {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.chainId);
  console.log("   Deployer:", contractInfo.deployer);
  
  return contractAddress;
}

// Execute deployment
main()
  .then((address) => {
    console.log(`\n🚀 Contract deployed at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });