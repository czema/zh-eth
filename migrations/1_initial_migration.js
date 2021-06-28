var fs = require('fs');

const ZhVoterProxy = artifacts.require("ZhVoterProxy");
const ZhToken = artifacts.require("ZhToken");

module.exports = function (deployer) {

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

  let zhVoterProxy = "0x33A8466f48e50A10af2E9d060e76e93F1B8e98cb";

  addContract("system", "voteProxy", zhVoterProxy);

//  deployer.deploy(ZhVoterProxy);

  deployer.deploy(ZhToken, zhVoterProxy).then(instance => {
    zh = instance;
    addContract("system", "zh", zh.address);
    return ZhVoterProxy.at(zhVoterProxy);
  });
};
