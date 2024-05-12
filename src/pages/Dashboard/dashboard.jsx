import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import axios from "axios";

import * as anchor from "@project-serum/anchor";

import {
  createMsg,
  getMsgAccounts,
  getUserAccounts,
  serverUrl,
  showToast,
} from "../../contracts/web3";
import { FaCloudUploadAlt, FaRegCheckCircle } from "react-icons/fa";
import { CircularProgress, Modal, Box, useMediaQuery } from "@mui/material";
import { USERSEEDS } from "../../contracts/constants";
import UserItem from "../../components/UserItem";
import { toast } from "react-toastify";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "20px",
  outline: "none",
  boxShadow: 24,
  overflow: "auto",
};

const SOLANA_HOST =
  "https://ultra-quick-frost.solana-mainnet.quiknode.pro/37bcbcb0976ff9f271aaf13e3bee2452de366636/";
const connection = new anchor.web3.Connection(SOLANA_HOST);
const BASIC_URL = "https://" + import.meta.env.VITE_GATEWAY_URL + "/ipfs/";

export const Mainboard = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const conditionalStyle = {
    ...style,
    width: isMobile ? "90%" : "600px",
  };

  const wallet = useWallet();

  // const [searchAddress, setSearchAddress] = useState('');
  // const [receiverData, setReceiverData] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState();
  const [cid, setCid] = useState("");
  const [userMsgList, setUserMsgList] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [userAccountList, setUserAccountsList] = useState([]);
  const [recommendedAccountList, setRecommendedAccountsList] = useState([]);
  const [userOwnerData, setUserOwner] = useState("");
  const [sends, setSends] = useState(0);
  const [receives, setReceives] = useState(0);
  const [totals, setTotals] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [showMsgList, setShowMsgList] = useState([]);
  const [sentMsgList, setSentMsgList] = useState([]);
  const [receiveMsgList, setReceiveMsgList] = useState([]);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [selectedPlusAddress, setSelectedPlusAddress] = useState("");
  const [selectedMinusAddress, setSelectedMinusAddress] = useState("");

  // const [fileName, setFileName] = useState();
  const addressRef = useRef(null);

  const onSend = async () => {
    const dataUrl = cid + "/" + file;
    if (dataUrl.length < 10) {
      showToast("Please select a file ...", 1500, 1);
      return;
    }
    if (addressRef.current.value.length < 44) {
      showToast("Sending address is incorrect.", 1500, 1);
      return;
    }
    let tx = await createMsg(wallet, addressRef.current.value, dataUrl);
    console.log("txhash: ", tx);
  };

  const getfetchAcounts = async () => {
    try {
      // Run multiple asynchronous operations in parallel
      const [UserData, userListResponse] = await Promise.all([
        getUserAccounts(wallet),
        axios.get(`${serverUrl}/api/user/getUserList`),
      ]);

      const users = JSON.parse(JSON.stringify(userListResponse.data.users));
      console.log(users);

      const [msgAccounts, sentAmount, receivedAmount] = await getMsgAccounts(
        wallet
      );

      const [UserAcounts, userOwner] = UserData;
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
            UserAcounts.find(
              (user) => user.userAddress.toBase58() === item.to_address
            )._id
          );
        } else if (
          wallet.publicKey.toBase58() === item.to_address &&
          wallet.publicKey.toBase58() !== item.from_address &&
          connectedList.findIndex(
            (account) => account?.userAddress.toBase58() === item.from_address
          ) < 0
        ) {
          connectedList.push(
            UserAcounts.find(
              (user) => user.userAddress.toBase58() === item.from_address
            )._id
          );
        }
      });
      console.log(UserAcounts, userOwner, users);

      // Process msgAccounts in parallel
      await Promise.all([
        msgAccounts.map(async (msgAccount) => {
          const from_address = msgAccount.from_address;
          const to_address = msgAccount.to_address;

          if (from_address == userOwner.userAddress.toBase58()) {
            const receiverUser = users.find(
              (userAccount) => userAccount.userAddress === to_address
            );

            if (receiverUser) {
              if (receiverUser.username && receiverUser.username.length > 0) {
                msgAccount["receiverName"] = receiverUser.username;
              }
            } else {
              msgAccount["receiverName"] = `${to_address.substr(
                0,
                4
              )}...${to_address.substr(-5)}`;
            }
            msgAccount["sent_or_Receive"] = true;
          }

          if (to_address == userOwner.userAddress.toBase58()) {
            const sentUser = users.find(
              (userAccount) => userAccount.userAddress === from_address
            );

            if (sentUser) {
              if (sentUser.username && sentUser.username.length > 0) {
                msgAccount["sentName"] = sentUser.username;
              }
            } else {
              msgAccount["sentName"] = `${from_address.substr(
                0,
                4
              )}...${from_address.substr(-5)}`;
            }
            msgAccount["sent_or_Receive"] = false;
          }
        }),
        axios
          .post(`${serverUrl}/api/user/updateContact`, {
            userAddress: wallet.publicKey.toBase58(),
            contacts: connectedList,
          })
          .then((res) => {
            console.log(res);
            setOpenContactModal(false);
          })
          .catch((err) => {
            console.log(err);
            toast("You are an unregistered user.", "error");
          }),
      ]);

      // Sort msgAccounts after all parallel operations are completed
      msgAccounts.sort((a, b) => parseInt(a.time) - parseInt(b.time));

      // Filter sent and received messages
      const sentMsgs = msgAccounts.filter((msg) => msg.sent_or_Receive);
      const ReceiveMsgs = msgAccounts.filter((msg) => !msg.sent_or_Receive);

      // Update state with the results
      setTotals(msgAccounts.length);
      setSends(sentAmount);
      setReceives(receivedAmount);
      setUserMsgList(msgAccounts);
      setSentMsgList(sentMsgs);
      setReceiveMsgList(ReceiveMsgs);
      setUserAccountsList(users);
      setRecommendedAccountsList(users);
      setUserOwner(userOwner);

      // Call updateFilter and setLoading(false) as needed
      updateFilter(filter);
      // setLoading(false);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // Handle error
    }
  };

  const updateFilter = (val) => {
    setFilter(val);
    if (val === "sent") {
      setShowMsgList(sentMsgList);
    } else if (val === "received") {
      setShowMsgList(receiveMsgList);
    } else {
      setShowMsgList(userMsgList);
    }
  };

  useEffect(() => {
    setPreview(null);
    console.log("preveiw, ", preview);
  }, []);

  useEffect(() => {
    if (wallet.connected) {
      const params = { userAddress: wallet.publicKey.toBase58() };
      axios
        .get(`${serverUrl}/api/user/getContacts`, { params })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setTotals(0);
      setSends(0);
      setReceives(0);
      setContacts([]);
      setUserMsgList([]);
      setUserAccountsList([]);
      setRecommendedAccountsList([]);
      setUserOwner("");
    }
    setPreview(null);
  }, [wallet, connection]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (wallet.connected) {
        getfetchAcounts();
      }
    }, 4000);
    return () => clearInterval(interval);
  });

  const onView = async (dataUrl, fileName) => {
    const downloadUrl = BASIC_URL + dataUrl;
    console.log("downloadUrl: ", downloadUrl);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = "*"; // specify the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDownload = async (dataUrl, fileName) => {
    const downloadUrl = BASIC_URL + dataUrl;
    fetch(downloadUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "downloaded-file";
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error fetching the file:", error);
      });
  };

  const onDrop = useCallback(async (e) => {
    const file = e.target.files[0];
    setFile(e.target.files[0].name);
    await uploadToCloud(e.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadToCloud = async (uploadfile) => {
    try {
      setLoading(true);
      console.log("loading started");
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
    } catch (error) {
      console.log(error);
    } finally {
      console.log("loading finished");
      setPreview(null);
      setLoading(false);
    }
  };

  const handleUserItemClick = (userItem) => {
    addressRef.current.value = userItem.userAddress;
  };

  const searchAccounts = (e) => {
    console.log(e.target.value);
    setKeyword(e.target.value);
    const accounts = userAccountList.filter(
      (account) =>
        account.username.toUpperCase().includes(e.target.value.toUpperCase()) ||
        account.userAddress.toUpperCase().includes(e.target.value.toUpperCase())
    );
    setRecommendedAccountsList(accounts);
  };

  const selectPlusUser = (address) => {
    setSelectedPlusAddress(address);
    setSelectedMinusAddress("");
  };

  const selectMinusUser = (address) => {
    setSelectedPlusAddress("");
    setSelectedMinusAddress(address);
  };

  const closeContactModal = () => {
    setOpenContactModal(false);
    setSelectedMinusAddress("");
    setSelectedPlusAddress("");
  };

  const addSelectedContact = (item) => {
    const contactList = JSON.parse(JSON.stringify(contacts));
    contactList.push(item);
    setContacts(contactList);
  };

  const removeSelectedContact = (address) => {
    const contactList = contacts.filter((item) => item.userAddress !== address);
    setContacts(contactList);
  };

  const confirmContactList = () => {
    console.log("here", contacts);
    const contact_ids = contacts.map((item) => {
      return item._id;
    });
    axios
      .post(`${serverUrl}/api/user/updateContact`, {
        userAddress: wallet.publicKey.toBase58(),
        contacts: contact_ids,
      })
      .then((res) => {
        console.log(res);
        setOpenContactModal(false);
      })
      .catch((err) => {
        console.log(err);
        toast("You are an unregistered user.", "error");
      });
  };

  return (
    <div className="h-full pt-4 px-4 sm:p-0">
      <div className="w-full flex items-center h-full">
        <div className="flex flex-col p-15 lg:p-10 lg:flex-row w-full gap-4">
          <div className="flex flex-col w-full sm:w-3/5 sm:pr-4 items-center">
            <div className="p-[24px] mb-4 sm:mb-8 bg-[#1B1B1B] rounded-2xl flex flex-col sm:flex-row w-full items-start sm:items-center justify-between">
              <div
                className="text-white flex flex-row hover:cursor-pointer"
                onClick={() => updateFilter("all")}
              >
                <p className="font-bold text-white text-3xl mr-4"> Dashboard</p>
                {/* <p className="mx-2 text-3xl">{totals}</p> */}
              </div>
              <div
                className="flex flex-row items-center hover:cursor-pointer"
                onClick={() => updateFilter("sent")}
              >
                <div className="text-white mx-0 w-4">
                  <img
                    className="w-10 h-10"
                    src="./icons/sent.svg"
                    alt="no image"
                  />
                </div>
                <div className="text-[#14F195] mx-0 flex flex-row text-2xl">
                  <p className="mx-2 text-3xl"> Sent: </p>
                  <p className="mx-2 text-3xl"> {sends} </p>
                </div>
              </div>
              <div
                className="flex flex-row items-center hover:cursor-pointer"
                onClick={() => updateFilter("received")}
              >
                <div className="text-white mx-0 w-5">
                  <img
                    className="w-10 h-10"
                    src="./icons/recieved.svg"
                    alt="no image"
                  />
                </div>
                <div className="text-[#9945FF] mx-0 flex flex-row">
                  <p className="mx-2 text-3xl"> Received: </p>
                  <p className="mx-2 text-3xl">{receives}</p>
                </div>
              </div>
              <div className="text-white w-5">
                {/* <img
                  className="w-10 h-10"
                  src="./icons/browse.svg"
                  alt="no image"
                /> */}
              </div>
            </div>
            <div className="p-4 sm:p-[24px] mb-4 sm:mb-8 col-span-1 bg-[#1B1B1B] w-full min-h-[500px] rounded-2xl  justify-items-center ">
              <div className="bg-[#1B1B1B] border-gray-500 border-b-2 w-full h-12 flex items-center justify-between">
                <div className="text-white">
                  <p className="font-bold text-white text-3xl">History</p>
                </div>
                <div className="text-white w-5">
                  {/* <img
                    className="w-10 h-10"
                    src="./icons/browse.svg"
                    alt="no image"
                  /> */}
                </div>
              </div>
              <div
                className="flex flex-col flex-1 py-2 sm:p-0 sm:h-[370px] overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {showMsgList.length > 0 ? (
                  showMsgList.map((msgItem, index) => {
                    // Check if the filter is 'all' or if the filter matches the message type
                    // Continue rendering the message if it matches the filter criteria
                    const fileName = msgItem.fileName
                      ? msgItem.fileName
                      : "No filename";
                    const sent_or_receive_name = msgItem.sent_or_Receive
                      ? msgItem.receiverName
                      : msgItem.sentName;

                    const datetime = new Date(msgItem.time * 1000);
                    const msgTimeStr = datetime.toLocaleString("en-US", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                    const messageType = msgItem.sent_or_Receive
                      ? "Sent"
                      : "Received";

                    return (
                      <div
                        key={index}
                        className="sm:my-2 bg-[#1B1B1B] border-b-[1px] border-[#323232] w-full h-12 flex items-center justify-between"
                      >
                        <div className="flex flex-1 flex-row items-center h-full mx-1 sm:mx-3">
                          <div className="text-white sm:mx-2 rounded-full bg-[#323232]">
                            <img
                              className="w-22 h-8 sm:w-10 sm:h-10 p-2"
                              src="./icons/receiver.svg"
                              alt="no image"
                            />
                          </div>
                          <div className="text-white flex flex-col">
                            <p className="font-bold w-24 sm:w-auto truncate">
                              {fileName}
                            </p>
                            <p className="text-[#888888] hidden sm:block">
                              {msgTimeStr}
                            </p>
                          </div>
                        </div>
                        <div className="text-white mx-0 w-1/3 flex flex-col">
                          <p className="mx-2  font-bold  texts">
                            {sent_or_receive_name}
                          </p>
                          <p className="mx-2 text-[#888888] ">{messageType}</p>
                        </div>
                        <div className="flex flex-row w-max items-center mx-2">
                          <button
                            onClick={() =>
                              onDownload(msgItem.dataUrl, fileName)
                            }
                          >
                            <img
                              className="w-5 h-5 mx-1"
                              src="./icons/download.svg"
                              alt="no image"
                            />
                          </button>
                          <button
                            onClick={() => onView(msgItem.dataUrl, fileName)}
                          >
                            <img
                              className="w-5 h-5 mx-1"
                              src="./icons/eye.svg"
                              alt="no image"
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full text-white justify-center items-center">
                    No History
                  </div>
                )}
              </div>
            </div>
            <div className="p-[24px] col-span-1 bg-[#1B1B1B] w-full h-full rounded-2xl justify-items-center">
              <div className="bg-[#1B1B1B] mb-2 w-full rounded-2xl flex items-center justify-between">
                <div className="text-white">
                  <p className="font-bold text-white text-3xl"> Contacts </p>
                </div>
                <div
                  className="text-white flex flex-row items-center cursor-pointer"
                  onClick={() => setOpenContactModal(true)}
                >
                  <svg
                    color="#14F195"
                    fill="#14F195"
                    width="24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-row overflow-x-auto gap-2">
                {contacts.length > 0 &&
                  contacts.map((userItem, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-[#1B1B1B] border-b-[#323232]lg w-[60px] rounded-2xl flex justify-center text-center"
                        onClick={() => handleUserItemClick(userItem)}
                      >
                        <div className="flex flex-col items-center h-full mx-0">
                          <div className="text-white mx-0 rounded-full bg-[#323232]">
                            <img
                              className="w-10 h-10 rounded-full"
                              // src="https://scarlet-official-minnow-138.mypinata.cloud/ipfs/QmNXi4X9HtNm1qHoiskxtr7oXSugKmPUY9vmuS7ojRRQ6T"
                              src={BASIC_URL + userItem.avatarUrl}
                              alt="no image"
                            />
                          </div>
                          <div className="text-white flex flex-col">
                            <p className="font-bold  text-ellipsis break-all">
                              {userItem.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full sm:w-2/5">
            <div className="flex-col w-full rounded-2xl p-6 bg-[#4E31AA] justify-between mb-4 sm:mb-8 text-white flex-1">
              <div className="flex flex-row justify-between items-center border-b-[1px] pb-1 border-gray-500">
                <p className="text-3xl">My Files </p>
                {/* <img
                  className="w-5 h-5"
                  src="./icons/browse.svg"
                  alt="no image"
                /> */}
              </div>
              <div className="flex flex-col max-h-96 overflow-y-auto">
                {userMsgList.length > 0 &&
                  userMsgList.map((msgItem, index) => {
                    return (
                      <div key={index} className="text-sm py-2 flex flex-row">
                        <img
                          className="w-7 h-7 mr-2"
                          src="./icons/docs.svg"
                          alt="no image"
                        />
                        <p className="text-lg">{msgItem.fileName}</p>
                      </div>
                    );
                  })}
                {file && (
                  <>
                    <div className="border-t-[1px] border-gray-500 pt-2">
                      Selected File
                    </div>
                    <div className="text-sm pt-2 flex flex-row w-full">
                      <img
                        className="w-7 h-7 mr-2"
                        src="./icons/docs.svg"
                        alt="no image"
                      />
                      <p className="text-lg flex-1 w-full">{file}</p>
                    </div>
                  </>
                )}
                {/* <div className="flex flex-row justify-between items-center m-5">
                <p className="text-sm text-[#888888]">Reorganize </p>
                <p className="text-sm text-[#888888]">17 Files </p>
              </div> */}
              </div>
            </div>
            <div className="bg-[#1B1B1B] mb-4 sm:mb-0 w-full rounded-2xl justify-center">
              <div className="flex text-white flex-row justify-between items-center m-5">
                <p className="text-3xl">Quick Send </p>
                {/* <img
                  className="w-5 h-5"
                  src="./icons/browse.svg"
                  alt="no image"
                /> */}
              </div>
              <div className="flex w-full justify-center items-center flex-col">
                <label
                  htmlFor="fileInput"
                  className="w-40 h-40 rounded-full border-2 bg-[#323232] border-dashed border-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="*"
                    className="hidden"
                    onChange={onDrop}
                  />
                  {preview ? (
                    <FaRegCheckCircle color="azure" size={50} />
                  ) : (
                    <FaCloudUploadAlt color="azure" size={50} />
                  )}
                </label>
                <p className="mt-2 text-gray-600">
                  Click or drag and drop a file here
                </p>
              </div>
              <div className="flex flex-row items-center justify-between m-2">
                <div className="min-w-content rounded-2xl m-2 w-full">
                  <input
                    type="text"
                    className="w-full bg-[#1f1f1f] rounded-[10px] p-2 text-white "
                    placeholder="Address..."
                    name="address"
                    ref={addressRef}
                  />
                </div>
                <button
                  className="send-button w-10 min-w-10 h-10 mx-1 flex justify-center items-center"
                  onClick={onSend}
                >
                  <img
                    className="w-1/2"
                    src="./icons/sender.svg"
                    alt="no image"
                  />
                </button>
              </div>
              {/* <div className="flex w-full justify-center items-center">
                <div className="flex justify-center items-center w-[120px] h-[120px] rounded-full  bg-[#323232] border-dashed border-2 border-[#7a7a81]">
                  <input
                    type="file"
                    className="w-full bg-[#1f1f1f] rounded-[10px] mx-2 p-2 text-white "
                    placeholder="Select Document"
                    onChange={onUpload}
                  ></input>
                  <img
                    className="size-1/2"
                    src="./icons/upload.svg"
                    alt="no image"
                  />
                </div>
              </div>
              <div
                className="flex flex-row items-center justify-between m-2"
                onClick={onSend}
              >
                <div className="min-w-content rounded-2xl m-2 w-full">
                  <input
                    type="text"
                    className="w-full bg-[#1f1f1f] rounded-[10px] p-2 text-white "
                    placeholder="Address..."
                    onChange={(ev) => setSearchAddress(ev.target.value)}
                  />
                </div>
                <div className="send-button w-10 min-w-10 h-10 mx-1 flex justify-center items-center">
                  <img
                    className="w-1/2"
                    src="./icons/sender.svg"
                    alt="no image"
                  />
                </div>
              </div> */}
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
      <Modal
        open={openContactModal}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" }, // Add backdrop filter for a blurred effect
        }}
        onClose={() => setOpenContactModal((e) => !e)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={conditionalStyle}>
          <div className="bg-[#1B1B1B] w-full rounded-2xl justify-center flex flex-col">
            <div className="flex text-white flex-row justify-between items-center p-5">
              <p className="text-2xl font-bold">Contacts </p>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 h-44 sm:h-[305px] flex flex-col px-2">
                <div className="flex justify-center">
                  <label className="text-white font-semibold text-center text-base px-4">
                    Selected accounts
                  </label>
                </div>
                <div className="flex flex-col h-40 sm:h-[290px] overflow-y-auto py-4">
                  {contacts &&
                    contacts.map((userItem, index) => {
                      return (
                        <div
                          key={index}
                          className={`cursor-pointer ${
                            userItem.userAddress === selectedMinusAddress &&
                            "bg-slate-400"
                          }`}
                          onClick={() => {
                            selectMinusUser(userItem.userAddress);
                          }}
                        >
                          <div className="flex flex-row w-full justify-between my-2">
                            <div className="flex flex-row w-full px-5">
                              <div className="mr-3">
                                <img
                                  className="w-10 h-10 mx-1 rounded-full"
                                  src={BASIC_URL + userItem.avatarUrl}
                                  alt="no image"
                                />
                              </div>
                              <div className="flex flex-1 flex-row border-b border-gray-400 items-center justify-between pr-2">
                                <div className="text-white text-sm font-bold">
                                  {userItem.username}
                                </div>
                                <button
                                  className="cursor-pointer"
                                  onClick={() =>
                                    removeSelectedContact(userItem.userAddress)
                                  }
                                >
                                  <svg
                                    fill="white"
                                    width="24"
                                    color="white"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="flex-1 h-44 sm:h-[305px] flex flex-col px-2 mb-[-12px]">
                <div className="flex justify-center">
                  <label className="text-white font-semibold text-center text-base px-4">
                    All accounts
                  </label>
                </div>
                <div className="flex flex-col h-40 sm:h-[290px] overflow-y-auto py-4">
                  {recommendedAccountList &&
                    recommendedAccountList.map((userItem, index) => {
                      return (
                        <div
                          key={index}
                          className={`cursor-pointer ${
                            userItem.userAddress === selectedPlusAddress &&
                            "bg-slate-400"
                          }`}
                          onClick={() => {
                            selectPlusUser(userItem.userAddress);
                          }}
                        >
                          <div className="flex flex-row w-full justify-between my-2">
                            <div className="flex flex-row w-full px-5">
                              <div className="mr-3">
                                <img
                                  className="w-10 h-10 mx-1 rounded-full"
                                  src={BASIC_URL + userItem.avatarUrl}
                                  alt="no image"
                                />
                              </div>
                              <div className="flex flex-1 flex-row border-b border-gray-400 items-center justify-between pr-2">
                                <div className="text-white text-sm font-bold">
                                  {userItem.username}
                                </div>
                                <button
                                  className="cursor-pointer"
                                  onClick={() => addSelectedContact(userItem)}
                                >
                                  <svg
                                    fill="white"
                                    width="24"
                                    color="white"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between m-2">
              <div className="min-w-content rounded-2xl m-2 w-full">
                <input
                  type="text"
                  className="w-full bg-[#1f1f1f] rounded-[10px] p-2 text-white "
                  placeholder="Search..."
                  value={keyword}
                  onChange={searchAccounts}
                />
              </div>
            </div>
            <div className="flex flex-row justify-end gap-2 p-2">
              <button
                type="button"
                className="bg-sky-500 rounded-md text-white font-bold p-2"
                onClick={confirmContactList}
              >
                Ok
              </button>
              <button
                type="button"
                className="bg-slate-600 text-white rounded-md font-bold p-2"
                onClick={closeContactModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
export default Mainboard;
