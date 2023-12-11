/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-use-before-define */
/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState, useEffect } from "react";
import { initialize } from "zokrates-js";
import { createWalletClient, custom, createPublicClient, http } from "viem";
// import { privateKeyToAccount } from "viem/accounts";
import { aurora } from "viem/chains";
// import "./style.css";
import { useAccount } from "wagmi";
import { Database } from "@tableland/sdk";
import { Wallet, getDefaultProvider } from "ethers";
import { Loader } from "./Loader2";
import { ContractData } from "../utils/Talent.json";

const table_talents = "talents_3141_162";
const table_talent_data = "talent_data_3141_164";

const ZKdiscord = (props) => {
  const [res, setRes] = useState();
  const [showProof, setShowProof] = useState(false);
  const [err, setErr] = useState();
  const [verification, setVerification] = useState(false);
  const [success, setSuccess] = useState(false);
  const [Loader_text, setText] = useState();
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const walletClient = createWalletClient({
    chain: aurora,
    transport: custom(window.ethereum)
  });
  const publicClient = createPublicClient({
    chain: aurora,
    transport: http()
  });
  const owner = new Wallet(process.env.REACT_APP_PK);
  const provider = getDefaultProvider("https://api.hyperspace.node.glif.io/rpc/v1");
  const signer = owner.connect(provider);
  useEffect(() => {
    const data = async () => {
      const { results } = await db
        .prepare(`SELECT * FROM ${table_talent_data};`)
        .all();
      console.log(results);
    };
    data();
  }, []);

  const handleSubmit = async () => {
    initialize().then((zokratesProvider) => {
      try {
        console.log(props.user, props.req);
        const source =
          "def main(private field a, field b) {assert(a == b); return;}";

        // compilation
        const artifacts = zokratesProvider.compile(source);

        // computation
        const { witness, output } = zokratesProvider.computeWitness(artifacts, [
          props.user,
          props.req
        ]);

        // run setup
        const keypair = zokratesProvider.setup(artifacts.program);

        // generate proof
        const proof = zokratesProvider.generateProof(
          artifacts.program,
          witness,
          keypair.pk
        );
        const isVerified = zokratesProvider.verify(keypair.vk, proof);
        console.log(isVerified);
        setVerification(true);
        const formatedProof = zokratesProvider.utils.formatProof(proof);
        console.log(formatedProof, proof.inputs);
        setRes(JSON.stringify(formatedProof[0]));
        setShowProof(true);
      } catch (error) {
        console.log(error);
        setErr(error);
      }
    });
  };
  const db = new Database({ signer });
  const JoinTalent = async () => {
    try {
      setLoading(true);
      setText("Contract Interaction");
      const hash = await walletClient.writeContract({
        address: props.data.contract_add,
        abi: ContractData.abi,
        functionName: "JoinTalent",
        account: address
      });
      // console.log(props.data);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(receipt);
      setText("DB Insert");
      const { meta: insert } = await db
        .prepare(
          `INSERT INTO ${table_talent_data} (user_add, talent_add, contributions) VALUES (?,?,?);`
        )
        .bind(address, props.data.contract_add, 0)
        .run();
      setSuccess(true);
      setLoading(false);
      await insert.txn.wait();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {success ? (
        <h1 style={{ marginLeft: "35%", marginTop: "20%" }}>
          {" "}
          ✅ Joined talent successfully
        </h1>
      ) : (
        <>
          {loading ? (
            <div style={{ marginLeft: "50%", marginTop: "20%" }}>
              <Loader text={Loader_text} />
            </div>
          ) : (
            <div className="zk-page">
              <button onClick={handleSubmit} className="zk-button">
                <span className="zk-button_top">Generate Proof</span>
              </button>
              {err ? (
                <h2 style={{ color: "red", textAlign: "center" }}>
                  You haven't joined the server as required by talent operator
                </h2>
              ) : (
                <>
                  {showProof ? <p>{res}</p> : <p />}
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  {verification ? <p>✅ Verified</p> : <></>}
                  <button className="dao-button" onClick={JoinTalent}>
                    <span className="zk-button_top">Join Talent</span>
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ZKdiscord;
