import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  createUserAccount,
  getMsgAccounts,
  getUserAccounts,
  showToast,
} from "../contracts/web3";
import clsx from "clsx";
import { Box, Modal, CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";

const SOLANA_HOST =
  "https://ultra-quick-frost.solana-mainnet.quiknode.pro/37bcbcb0976ff9f271aaf13e3bee2452de366636/";
const connection = new anchor.web3.Connection(SOLANA_HOST);
const BASIC_URL = "https://" + import.meta.env.VITE_GATEWAY_URL + "/ipfs/";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 370,
  bgcolor: "#1B1B1B",
  borderRadius: "10px",
  boxShadow: 24,
  paddingTop: "16px",
};
export default function Header({ isMenuOpen, toggleMenu }) {
  const wallet = useWallet();
  const [preview, setPreview] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const nameRef = useRef("");
  const [toggleModal, setToggleModal] = useState(false);
  const [file, setFile] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [userMsgList, setUserMsgList] = useState([]);
  const [userAccountList, setUserAccountsList] = useState([]);
  const [userOwnerData, setUserOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalName, setModalName] = useState("");

  const getfetchAcounts = async () => {
    const res = await getUserAccounts(wallet);
    const [UserAcounts, userOwner] = res;
    const msgAccounts = await getMsgAccounts(wallet);
    setUserMsgList(msgAccounts);
    setUserAccountsList(UserAcounts);
    setUserOwner(userOwner);
  };
  useEffect(() => {
    if (wallet.connected) {
      (async () => {
        const userInfo = await getfetchAcounts(wallet);
        setUserInfo(userInfo);
      })();
    } else {
      setUserOwner("");
      setUserMsgList([]);
      setUserAccountsList([]);
    }
  }, [wallet, connection]);

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        if (wallet.connected) {
          const userInfo = await getfetchAcounts(wallet);
          setUserInfo(userInfo);
        } else {
          setUserOwner("");
          setUserMsgList([]);
          setUserAccountsList([]);
        }
      })();
    }, 10000);

    return () => clearInterval(interval);
  });

  const handleEditToggleModal = () => {
    setPreview(BASIC_URL + userOwnerData.avatarUrl);
    setModalName(userOwnerData.username);
    // if (userOwnerData.username && userOwnerData.avatarUrl) {
    //   setPreview(userOwnerData.avatarUrl);
    // }
    setToggleModal((prevState) => !prevState);
  };

  const handleToggleModal = () => {
    if (userOwnerData.username && userOwnerData.avatarUrl) {
      setPreview(userOwnerData.avatarUrl);
    } else {
      setPreview(null);
      setModalName("");
    }
    setToggleModal((prevState) => !prevState);
  };

  const handleNameChange = (e) => {
    setModalName(e.target.value);
  };

  const onRegister = async () => {
    if (userAvatarUrl == "") {
      showToast("please select photo file ...", 1500, 1);
      return;
    }
    if (nameRef.current.value.length <= 0) {
      showToast("please input name.", 1500, 1);
      return;
    }

    let tx = await createUserAccount(
      wallet,
      nameRef.current.value,
      userAvatarUrl
    );
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
      setUserAvatarUrl(resData.IpfsHash + "/" + uploadfile.name);
    } catch (error) {
    } finally {
      setLoading(false);
      setPreview(null);
    }
  };

  return (
    <header className="flex items-center justify-end text-white my-0 ">
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center w-full justify-between text-white px-4 sm:px-[60px] sm:py-[20px] h-20 sm:h-24 border-b border-gray-600">
          <div className="time-menu-root hidden sm:block">
            <div className="text-white text-2xl">
              <a href="" target="" rel="noopener noreferrer">
                <span className="text-4xl">SolDocs</span>
              </a>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between w-full">
            <button onClick={toggleMenu} className="min-w-8 sm:hidden">
              <svg
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </button>
            <div className="sm:relative flex flex-row items-center justify-end w-full ">
              <WalletMultiButton />
              {userOwnerData.username ? (
                <div className="mx-2">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={BASIC_URL + userOwnerData.avatarUrl}
                    onClick={handleEditToggleModal}
                    alt=""
                  />
                </div>
              ) : (
                <button
                  className="send-button py-2 ml-2"
                  onClick={handleToggleModal}
                >
                  <img className="w-5 mx-2" alt="" src="./icons/sign.svg"></img>
                </button>
              )}
            </div>
          </div>
          {toggleModal && (
            <Modal
              open={open}
              onClose={handleToggleModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <button
                  onClick={handleToggleModal}
                  className="sm:hidden fixed top-4 right-4"
                >
                  <svg
                    fill="none"
                    width="28"
                    color="gray"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex w-full justify-center items-center flex-col">
                  <label
                    htmlFor="avatarInput"
                    className="w-40 h-40 rounded-full border-2 bg-[#323232] border-dashed border-gray-400 flex items-center justify-center cursor-pointer"
                    // onClick={handleClick}
                  >
                    <input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onDrop}
                    />
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaCloudUploadAlt color="azure" size={50} />
                    )}
                  </label>
                  <p className="mt-2 text-gray-600">
                    Click or drag and drop an image here
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between m-2">
                  <div className="min-w-content rounded-2xl m-2 w-full">
                    <input
                      type="text"
                      className="w-full bg-[#1f1f1f] rounded-[10px] p-2 text-white "
                      placeholder="Name"
                      name="name"
                      value={modalName}
                      onChange={handleNameChange}
                      ref={nameRef}
                    />
                  </div>
                  <button
                    className="send-button w-10 min-w-10 h-10 mx-1 flex justify-center items-center"
                    onClick={onRegister}
                  >
                    <img
                      className="w-1/2"
                      src="./icons/sender.svg"
                      alt="no image"
                    />
                  </button>
                </div>
              </Box>
            </Modal>
          )}
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
      </div>
    </header>
  );
}
