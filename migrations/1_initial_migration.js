var fs = require('fs');
var BN = require('big-number');

const CurveVoterProxy = artifacts.require("CurveVoterProxy");
const ZhToken = artifacts.require("ZhToken");
const zhEpsToken = artifacts.require("zhEpsToken");
const EpsDepositor = artifacts.require("EpsDepositor");

const IERC20 = artifacts.require("IERC20");

module.exports = function (deployer, network, accounts) {
  if (network != "ganache") return true;
  
  let zhDeployer = "0x947b7742c403f20e5faccdac5e092c943e7d0277"; // This should be "me" on the chain.
  let zhVoterProxy = "0x989AEb4d175e16225E39E87d0D97A3360524AD80"; // I believe this is supposed to be deployed as a separate contract?
  let zhTreasury = "0x1389388d01708118b497f59521f6943Be2541bb7"; // I believe this is supposed to be deployed as a separate contract?
  
  let eps = "0xA7f552078dcC247C2684336020c03648500C6d9F";
  let weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  
  let admin = accounts[0];
  console.log("Deploying from: " + admin);

  var premine = new BN(0);
  premine.add("14000000000000000000000");

  var voter, zh, zhEps, deposit;
  var epsToken;
  var epsdepositAmt, epsbal, zhEpsBal;

  let contractList = {};
  let systemContracts = {};
  contractList["system"] = systemContracts;

  let addContract = function (group, name, value) {
    contractList[group][name] = value;
    let output = JSON.stringify(contractList, null, 3);

    fs.writeFileSync("contracts.json", output, err => {
      if (err) {
        return console.log("Error writing file: " + err);
      }
    });
  };

  addContract("system", "voteProxy", zhVoterProxy);
  addContract("system", "treasury", zhTreasury);

  deployer.deploy(ZhToken, zhVoterProxy).then(instance => {
    zh = instance;
    addContract("system", "zh", zh.address);
    return CurveVoterProxy.at(zhVoterProxy);
  })
  .then(instance => {
    voter = instance;
    console.log("owner: " + voter.owner());
    return voter.owner();
  })
  .then(currentOwner => {
    if (currentOwner != admin) {
    	console.log(admin);
    	console.log(currentOwner);
      return voter.setOwner(admin, {from : currentOwner});
    }
  })
  .then(() => {
    return zh.mint(accounts[0], premine.toString());
  })
  .then(() => deployer.deploy(zhEpsToken))
  .then(instance => {
    zhEps = instance;
    addContract("system", "zhEps", zhEps.address);
    
    return deployer.deploy(EpsDepositor, voter.address, zhEps.address);
  })
  .then(instance => {
    deposit = instance;
    addContract("system", "epsDepositor", deposit.address);
     
    return zhCrv.setOperator(deposit.address);
  })
  .then(() => {
    return voter.setDepositor(deposit.address); 
  })
  .then(() => {
    return deposit.initialLock();
  })
  .then(() => {
    var output = JSON.stringify(contractList, null, 4);
    console.log(output);
    fs.writeFileSync("contracts.json", output, err => {
    	if (err) {
    		return console.log("Error writing file: " + err);
    	}
    });
  });
};
