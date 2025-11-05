import { useState } from "react";

export const MakeRequest = () => {
  const [title, setTitle] = useState("");

  function handleSaveRequest(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-3">
      <h1>Make Request</h1>

      <div className="flex flex-col bg-white border-1 border-gray-200 p-2 rounded-xl  gap-2">
        <h3>Title</h3>
        <input
          type="text"
          placeholder="Request title"
          className="border-1 border-gray-200 p-2 rounded-xl"
          onChange={(e) => setTitle(e.target.value)}
        />

        <h3>Description</h3>
        <input
          type="text"
          placeholder="Request description"
          className="border-1 border-gray-200 p-2 rounded-xl"
        />

        <h3>Cost</h3>
        <input
          type="number"
          placeholder="Request cost"
          className="border-1 border-gray-200 p-2 rounded-xl"
        />

        <button className="buttonRed w-1/4" onClick={() => handleSaveRequest()}>
          Save
        </button>
      </div>
    </div>
  );
};
