import React from "react";
import { CgProfile } from "react-icons/cg";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-slate-100 rounded-md p-6 m-8">
      <div className="flex flex-col justify-center items-center">
        <CgProfile className="w-auto h-56 m-7" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <h1 className="">Lucas</h1>
      </div>
    </div>
  );
};

export default ProfilePage;
  