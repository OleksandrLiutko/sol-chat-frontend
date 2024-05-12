import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { CircularProgress, Modal } from "@mui/material";
import moment from "moment";

import * as anchor from "@project-serum/anchor";

import UserItem from "../../components/UserItem";
import ChatItem from "../../components/ChatItem";
import {
  createMsg,
  getMsgAccounts,
  getUserAccounts,
  showToast,
} from "../../contracts/web3";

const SOLANA_HOST =
  "https://ultra-quick-frost.solana-mainnet.quiknode.pro/37bcbcb0976ff9f271aaf13e3bee2452de366636/";
const connection = new anchor.web3.Connection(SOLANA_HOST);
const BASIC_URL = "https://" + import.meta.env.VITE_GATEWAY_URL + "/ipfs/";

export const Conversation = () => {
  const wallet = useWallet();

  const [filter, setFilter] = useState("");
  const [receiverData, setReceiverData] = useState("");
  const [recieverWalletAddress, setRecieverWalletAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [userMsgList, setUserMsgList] = useState([]);
  const [userMsgHistoy, setUserMsgHistoy] = useState([]);
  const [userAccountList, setUserAccountsList] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [connectedAccountList, setConnectedAccountList] = useState([]);
  const [userOwnerData, setUserOwner] = useState("");
  const [sends, setSends] = useState(0);
  const [receives, setReceives] = useState(0);
  const [totals, setTotals] = useState(0);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [activeTag, setActiveTag] = useState(1);

  const fileInputRef = useRef();

  useEffect(() => {
    if (!wallet || !wallet.publicKey) {
      return;
    }
    // setRecieverWalletAddress(wallet.publicKey.toBase58());
    (async () => {})();
    // if (wallet.connected) setLoading(true);
  }, [wallet.publicKey]);

  const getfetchAcounts = async () => {
    const [UserAccounts, userOwner] = await getUserAccounts(wallet);
    let [msgAccounts, sentAmount, receivedAmount] = await getMsgAccounts(
      wallet
    );
    let connectedList = [];
    msgAccounts.map((item) => {
      if (
        wallet.publicKey.toBase58() === item.from_address &&
        wallet.publicKey.toBase58() !== item.to_address &&
        connectedList.findIndex(
          (account) => account.userAddress.toBase58() === item.to_address
        ) < 0
      ) {
        connectedList.push(
          UserAccounts.find(
            (user) => user.userAddress.toBase58() === item.to_address
          )
        );
      } else if (
        wallet.publicKey.toBase58() === item.to_address &&
        wallet.publicKey.toBase58() !== item.from_address &&
        connectedList.findIndex(
          (account) => account.userAddress.toBase58() === item.from_address
        ) < 0
      ) {
        connectedList.push(
          UserAccounts.find(
            (user) => user.userAddress.toBase58() === item.from_address
          )
        );
      }
    });

    msgAccounts = msgAccounts.sort((a, b) => {
      // Convert the time strings to numbers for comparison
      const timeA = parseInt(a.time);
      const timeB = parseInt(b.time);

      // Compare the time values
      if (timeA < timeB) {
        return -1;
      }
      if (timeA > timeB) {
        return 1;
      }
      // If timeA and timeB are equal
      return 0;
    });

    setConnectedAccountList(connectedList);
    setTotals(msgAccounts.length);
    setSends(sentAmount);
    setReceives(receivedAmount);
    setUserMsgList(msgAccounts);
    setUserAccountsList(UserAccounts);
    setAllAccounts(UserAccounts);
    setUserOwner(userOwner);
    // setLoading(false);
  };

  const getInitfetchAcounts = async () => {
    const [UserAcounts, userOwner] = await getUserAccounts(wallet);
    const [msgAccounts, sentAmount, receivedAmount] = await getMsgAccounts(
      wallet
    );
    setUserName(UserAcounts[0].username);
    setRecieverWalletAddress(UserAcounts[0].userAddress.toBase58());
    setUserAvatarUrl(UserAcounts[0].avatarUrl);

    let msgList = [];
    for (let i = 0; i < userMsgList.length; i++) {
      let msgaccount = userMsgList[i];
      if (
        UserAcounts[0].userAddress.toBase58() === msgaccount.from_address ||
        UserAcounts[0].userAddress.toBase58() === msgaccount.to_address
      ) {
        msgList.push(msgaccount);
      }

      if (i == userMsgList.length - 1) {
        setUserMsgHistoy(msgList);
        // setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (wallet.connected) getInitfetchAcounts();
  }, [wallet, connection]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (wallet.connected) getfetchAcounts();
    }, 4000);

    return () => clearInterval(interval);
  });

  const onUpload = async (e) => {
    setFile(e.target.files[0].name);
    await uploadToCloud(e.target.files[0]);
  };

  const uploadToCloud = async (uploadfile) => {
    try {
      // setLoading(true);
      const formData = new FormData();
      formData.append("file", uploadfile);
      const metadata = JSON.stringify({
        name: uploadfile.name,
      });

      formData.append("pinataMetadata", metadata);
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      setCid(resData.IpfsHash);
      setFileName(uploadfile.name);
    } catch (error) {
      console.log(error);
    } finally {
      // setLoading(false);
    }
  };

  const onSend = async () => {
    const dataUrl = cid + "/" + file;

    console.log("recieverWalletAddress:", recieverWalletAddress);
    if (file === "") {
      showToast("Please select a file ...", 1500, 1);
      return;
    }
    if (recieverWalletAddress.length < 44) {
      showToast("Sending address is incorrect.", 1500, 1);
      return;
    }
    let tx = await createMsg(wallet, recieverWalletAddress, dataUrl);
    console.log("txhash: ", tx);
  };

  const userSelect = (userItem) => {
    setUserName(userItem.username);
    setRecieverWalletAddress(userItem.userAddress.toBase58());
    setUserAvatarUrl(userItem.avatarUrl);
    let msgList = [];
    for (let i = 0; i < userMsgList.length; i++) {
      let msgaccount = userMsgList[i];
      if (
        userItem.userAddress.toBase58() === msgaccount.from_address ||
        userItem.userAddress.toBase58() === msgaccount.to_address
      ) {
        msgList.push(msgaccount);
      }

      if (i == userMsgList.length - 1) {
        setUserMsgHistoy(msgList);
      }
    }
  };

  const searchAccounts = (e) => {
    console.log(e.target.value);
    setFilter(e.target.value);
    const accounts = allAccounts.filter(
      (account) =>
        account.username.toUpperCase().includes(e.target.value.toUpperCase()) ||
        account.userAddress
          .toBase58()
          .toUpperCase()
          .includes(e.target.value.toUpperCase())
    );
    setUserAccountsList(accounts);
  };

  return (
    <div className="h-full">
      <div className="w-full flex items-center h-full px-4 py-4 sm:px-[60px] sm:py-[40px]">
        <div className="flex flex-col sm:flex-row w-full gap-4 sm:gap-6">
          <div className="flex flex-col w-full sm:w-2/3">
            <div className="col-span-1 bg-[#1B1B1B] w-full h-full rounded-2xl justify-items-center flex flex-col">
              <div className="m-2 bg-[#1B1B1B] w-rounded-2xl flex items-center justify-between ">
                <div className="text-white mx-0 flex flex-row">
                  {wallet.connected ? (
                    <>
                      <img
                        className="w-12 h-12 rounded-full"
                        src={BASIC_URL + userAvatarUrl}
                        alt="no image"
                      />
                      <div className="text-white mx-3 flex flex-col w-full">
                        <p className="font-bold text-white ">{userName}</p>
                        <p className="w-[278px] sm:w-auto text-white truncate">
                          {" "}
                          {recieverWalletAddress}{" "}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="items-center flex flex-row">
                      <img
                        className="w-10 h-10"
                        src="./icons/solchat.svg"
                        alt="no image"
                      />
                      <h1 className="text-2xl items-center">
                        &nbsp;No Conversations
                      </h1>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="h-[500px] sm:h-full bg-[#101011] w-full p-5 border-line border-2 border-[#1B1B1B] justify-end overflow-y-auto "
                style={{ scrollbarWidth: "none" }}
              >
                {userMsgHistoy &&
                  userMsgHistoy.map((userItem, index) => {
                    return (
                      <ChatItem
                        key={index}
                        downloadUrl={userItem.dataUrl}
                        viewUrl={userItem.dataUrl}
                        fileName={userItem.fileName}
                        send={
                          userItem.from_address == wallet.publicKey.toBase58()
                            ? true
                            : false
                        }
                        time={
                          new Date(userItem.time * 1000).toLocaleDateString() +
                          " " +
                          new Date(userItem.time * 1000)
                            .toUTCString()
                            .slice(-11, -4)
                        }
                      />
                    );
                  })}
              </div>
              <div className="flex flex-row  m-2 items-center">
                <div className="min-w-content rounded-2xl mx-2 h-10 w-full bg-[#1f1f1f] rounded-[10px] mx-2  text-white border bg-[#323232] border-dashed border-gray-400 flex justify-start items-center">
                  <button
                    className="flex flex-row"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <img
                      className="mx-2"
                      src="./icons/upload.svg"
                      alt="no image"
                    />
                    {fileName === "" ? "Select Document" : fileName}
                  </button>
                  <input
                    type="file"
                    className="w-full bg-[#1f1f1f] rounded-[10px] mx-2 p-2 text-white border-2 bg-[#323232] border-dashed border-gray-400"
                    placeholder="Select Document"
                    onChange={onUpload}
                    multiple={false}
                    ref={fileInputRef}
                    hidden
                  />
                </div>
                <div
                  className="send-button w-10 min-w-10 h-10 mx-2 flex justify-center items-center"
                  onClick={onSend}
                >
                  <img
                    className="w-1/2"
                    src="./icons/sender.svg"
                    alt="no image"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full sm:w-1/3">
            <div className="bg-[#1B1B1B] w-full rounded-2xl justify-center flex flex-col">
              <div className="flex text-white flex-row justify-between items-center p-5">
                <p className="text-2xl font-bold">Conversations </p>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex-1 sm:h-[305px] flex flex-col px-2">
                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      <div
                        className={`flex flex-1 py-[2px] text-white font-semibold text-center h-full sm:h-12 justify-center items-center px-4 border-gray-700 cursor-pointer ${
                          activeTag === 1
                            ? "bg-gradient-to-r from-[#2ad3a8] via-[#579bcc] via-48% to-[#885ef0] rounded-tl-lg"
                            : "border-[1px] rounded-tl-md"
                        }`}
                        onClick={() => setActiveTag(1)}
                      >
                        Connected accounts
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`flex flex-1 py-[2px] text-white font-semibold h-full sm:h-12 justify-center items-center text-center px-4 border-gray-700 cursor-pointer ${
                          activeTag === 2
                            ? "bg-gradient-to-r from-[#2ad3a8] via-[#579bcc] via-48% to-[#885ef0] rounded-tr-lg"
                            : "border-[1px] rounded-tr-md"
                        }`}
                        onClick={() => setActiveTag(2)}
                      >
                        All accounts
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col h-[400px] sm:h-[580px] overflow-y-auto py-4 border-[1px] border-gray-700 rounded-b-md border-t-0">
                    {activeTag === 1 &&
                      connectedAccountList &&
                      connectedAccountList.map((userItem, index) => {
                        return (
                          <div
                            key={index}
                            className="hover:cursor-pointer"
                            onClick={() => {
                              userSelect(userItem);
                            }}
                          >
                            <UserItem
                              img={BASIC_URL + userItem.avatarUrl}
                              name={userItem.username}
                              // attachment="Document Attachment"
                              // time="12:30"
                            />
                          </div>
                        );
                      })}
                    {activeTag === 2 &&
                      userAccountList &&
                      userAccountList.map((userItem, index) => {
                        return (
                          <div
                            key={index}
                            className="hover:cursor-pointer"
                            onClick={() => {
                              userSelect(userItem);
                            }}
                          >
                            <UserItem
                              img={BASIC_URL + userItem.avatarUrl}
                              name={userItem.username}
                              // attachment="Document Attachment"
                              // time="12:30"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
                {/* <div className='flex-1 sm:h-[305px] flex flex-col px-2 mb-[-12px]'>
                  <label className='text-white font-semibold text-center px-4'>
                    All accounts
                  </label>
                  <div className='flex flex-col h-[290px] overflow-y-auto py-4'>
                    {userAccountList &&
                      userAccountList.map((userItem, index) => {
                        // console.log(BASIC_URL + userItem.avatarUrl)
                        return (
                          <div
                            key={index}
                            className='hover:cursor-pointer'
                            onClick={() => {
                              userSelect(userItem);
                            }}
                          >
                            <UserItem
                              img={BASIC_URL + userItem.avatarUrl}
                              name={userItem.username}
                              // attachment="Document Attachment"
                              // time="12:30"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div> */}
              </div>
              <div
                className={`flex flex-row items-center justify-between m-2 ${
                  activeTag === 1 && " invisible"
                }`}
              >
                <div className="min-w-content rounded-2xl m-2 w-full">
                  <input
                    type="text"
                    className="w-full bg-[#1f1f1f] rounded-[10px] p-2 text-white "
                    placeholder="Search..."
                    value={filter}
                    onChange={searchAccounts}
                  />
                </div>
                {/* <div className="w-10 min-w-10 h-10 mx-1 flex justify-center items-center">
                  <img
                    className="w-1/2 mx-1"
                    src="./icons/add.svg"
                    alt="no image"
                  />
                  <img
                    className="w-1/2 mx-1"
                    src="./icons/delete.svg"
                    alt="no image"
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={loading}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" }, // Add backdrop filter for a blurred effect
        }}
        className="flex items-center justify-center outline-none"
      >
        <div className="flex flex-col items-center justify-center border-none outline-none">
          <div>
            <CircularProgress size={100} thickness={4} />{" "}
          </div>
          {/* Larger CircularProgress */}
          <div>
            <p className="text-white text-base">Loading...</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Conversation;
