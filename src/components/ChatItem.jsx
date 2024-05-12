const BASIC_URL = 'https://' + import.meta.env.VITE_GATEWAY_URL + '/ipfs/';

const ChatItem = (props) => {
  const onView = async (dataUrl, fileName) => {
    const downloadUrl = BASIC_URL + dataUrl;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = '*'; // specify the filename
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
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'downloaded-file';
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Error fetching the file:', error);
      });
  };
  return (
    <>
      <div
        className={`flex justify-${
          props.send ? 'end' : 'start'
        } items-center w-full my-1 p-2`}
      >
        <div
          className={`w-11/12 sm:w-2/3 ${
            props.send ? 'bg-[#1E053D]' : 'bg-[#002D1A]'
          } flex flex-row justify-between rounded-2xl border-line border ${
            props.send ? 'border-[#8f49ff]' : 'border-[#6aa56d]'
          }`}
        >
          {/* <div className="w-2/3 bg-[#002D1A] flex flex-row justify-between rounded-2xl border-line border border-[#6aa56d]"> */}
          <div className="flex flex-row mx-2 p-2">
            <div className="flex justify-center items-center">
              <img
                className="w-8 h-8 mx-1"
                src="./icons/docs.svg"
                alt="no image"
              />
            </div>
            <div className="w-32 sm:w-auto flex flex-col">
              <p className="text-white font-bold break-words">{`${
                props.fileName
              } ${props.send ? 'Sent' : 'Received'}`}</p>
              <p className="text-white text-[10px] font-sm ">
                Secure Safe Encrypted
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center mx-2">
            <button
              onClick={() => onDownload(props.downloadUrl, props.fileName)}
            >
              <img
                className="w-5 h-5 mx-1"
                src="./icons/download.svg"
                alt="no image"
              />
            </button>
            <button onClick={() => onView(props.viewUrl, props.fileName)}>
              <img
                className="w-5 h-5 mx-1"
                src="./icons/eye.svg"
                alt="no image"
              />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`flex justify-${
          props.send ? 'end' : 'start'
        } items-center w-full my-0`}
      >
        <p className="text-white text-[12px] font-sm  mx-2">{`${
          props.send ? 'Sent' : 'Received'
        } ${props.time}`}</p>
      </div>
    </>
  );
};

export default ChatItem;
