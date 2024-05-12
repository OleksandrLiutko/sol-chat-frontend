import * as anchor from "@project-serum/anchor";
import { PROGRAM_ID, USERSEEDS } from "./constants";
import { IDL } from "./solchat";
import { toast } from "react-toastify";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Connection, Transaction, SystemProgram } from "@solana/web3.js";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import axios from "axios";

const SOLANA_HOST =
  "https://ultra-quick-frost.solana-mainnet.quiknode.pro/37bcbcb0976ff9f271aaf13e3bee2452de366636/";
const connection = new anchor.web3.Connection(SOLANA_HOST);
export const serverUrl = "https://soldocs.org/";

export const getProgram = (wallet) => {
  let provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);
  return program;
};

const getUserKey = async (wallet) => {
  const [userKey] = await asyncGetPda(
    [Buffer.from(USERSEEDS), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  return userKey;
};

const getMsgKey = async (wallet, to_address, data) => {
  const [msgKey] = await asyncGetPda(
    [wallet.publicKey.toBuffer(), Buffer.from(data)],
    PROGRAM_ID
  );
  return msgKey;
};

export const createUserAccount = async (wallet, username, avatarUrl) => {
  if (wallet.publicKey === null) throw new WalletNotConnectedError();

  const program = getProgram(wallet);
  const userkey = await getUserKey(wallet);

  const tx = new Transaction().add(
    await program.methods
      .createUser(username, avatarUrl)
      .accounts({
        userAccount: userkey,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction()
  );
  return await send(connection, wallet, tx);
};

export const createMsg = async (wallet, to_address, data) => {
  if (wallet.publicKey === null) throw new WalletNotConnectedError();
  const program = getProgram(wallet);

  const dataseed = data.substring(0, 5);

  const msgKey = await getMsgKey(wallet, to_address, data.substring(0, 5));

  const tx = new Transaction().add(
    await program.methods
      .createMsg(to_address, data)
      .accounts({
        msgAccount: msgKey,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction()
  );
  return await send(connection, wallet, tx);
};

export const getUserAccounts = async (wallet) => {
  const program = getProgram(wallet);
  const accounts = await program.account.userAccount.all();
  // Initialize an empty array to store user accounts
  const userAccounts = [];
  let userOwner = {};
  // Loop through each user account
  for (const account of accounts) {
    let userdata = {};
    let url = account.account.avatarUrl;
    let avatarUrl = url.split("/")[0];
    let fileName = url.split("/")[1];
    userdata["fileName"] = fileName;
    userdata["avatarUrl"] = avatarUrl;
    userdata["url"] = url;
    userdata["userAddress"] = account.account.userAddress;
    userdata["username"] = account.account.username;
    if (
      account.account.userAddress.toString() === wallet.publicKey.toString()
    ) {
      userOwner = userdata;
    } else {
      userAccounts.push(userdata);
    }
  }
  axios.post(`${serverUrl}/api/user/updateList`, userAccounts);
  // Return the list of user accounts
  return [userAccounts, userOwner];
};

export const getUserAccount = async (wallet) => {
  const userKey = getUserKey(wallet);
  const userInfo = await connection.getAccountInfo(userKey);
  return userInfo;
};

export const getMsgAccounts = async (wallet) => {
  const program = getProgram(wallet);
  const accounts = await program.account.msgAccount.all();
  const msgList = [];
  let msgSentAmount = 0;
  let msgReceivedAmount = 0;
  for (const account of accounts) {
    if (
      account.account.fromAddress === wallet.publicKey.toString() ||
      account.account.toAddress === wallet.publicKey.toString()
    ) {
      let msgdata = {};
      msgdata["from_address"] = account.account.fromAddress;
      msgdata["to_address"] = account.account.toAddress;
      let url = account.account.data;
      let dataUrl = url.split("/")[0];
      let fileName = url.split("/")[1];
      msgdata["dataUrl"] = dataUrl;
      msgdata["fileName"] = fileName;
      msgdata["time"] = account.account.time;
      msgList.push(msgdata);
      if (account.account.fromAddress === wallet.publicKey.toString())
        msgSentAmount++;
      else if (account.account.toAddress === wallet.publicKey.toString())
        msgReceivedAmount++;
    }
  }
  return [msgList, msgSentAmount, msgReceivedAmount];
};

const asyncGetPda = async (seeds, programId) => {
  const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
  return [pubKey, bump];
};

export async function send(connection, wallet, transaction) {
  const txHash = await sendTransaction(connection, wallet, transaction);
  if (txHash != null) {
    let confirming_id = showToast("Confirming Transaction ...", -1, 2);
    try {
      let res = await connection.confirmTransaction(txHash, "processed");
      toast.dismiss(confirming_id);
      if (res.value.err) showToast("Transaction Failed", 2000, 1);
      else showToast("Transaction Confirmed", 2000);
    } catch (e) {
      showToast("Transaction Failed", 2000, 1);
    }
  } else {
    showToast("Transaction Failed", 2000, 1);
  }
  return txHash;
}

export async function sendTransaction(connection, wallet, transaction) {
  if (wallet.publicKey === null || wallet.signTransaction === undefined)
    return null;
  try {
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = wallet.publicKey;
    const signedTransaction = await wallet.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();

    showToast("Sending Transaction ...", 500);
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      preflightCommitment: "processed",
    });
    return txid;
  } catch (e) {
    return null;
  }
}

export const showToast = (txt, duration = 5000, ty = 0) => {
  let autoClose = duration;
  if (duration < 0) {
    autoClose = false;
  }

  if (ty === 1) {
    return toast.error(txt, {
      position: "bottom-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  } else {
    return toast.success(txt, {
      position: "bottom-right",
      autoClose,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }
};
