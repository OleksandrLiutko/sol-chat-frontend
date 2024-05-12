const UserItem = (props) => {
  return (
    <div className="flex flex-row w-full justify-between my-2">
      <div className="flex flex-row w-full px-5">
        <div className="mr-3">
          <img
            className="w-10 h-10 mx-1 rounded-full"
            src={props.img}
            alt="no image"
          />
        </div>
        <div className="flex flex-1 flex-row border-b border-gray-400 items-center">
          <div className="flex flex-row flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className="text-white text-sm  font-bold">{props.name}</div>
              {/* <div className="flex flex-row text-white text-sm  font-bold my-1">
                <img
                  className="w-4 h-4 rounded-full"
                  src="./icons/docs.svg"
                  alt="no image"
                />
                <div className="text-white text-[10px]  font-bold">
                  {props.attachment}
                </div>
              </div> */}
            </div>
          </div>
          {/* <div className="flex flex-row text-white text-[12px] ml-5">
            <img
              className="w-4 h-4 rounded-full mx-1"
              src="./icons/checked.svg"
              alt="no image"
            />
            <p>{props.time}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserItem;
