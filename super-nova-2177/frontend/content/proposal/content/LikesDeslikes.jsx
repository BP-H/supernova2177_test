"use client";
import { useState, useEffect } from "react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoIosArrowUp } from "react-icons/io";
import LikesInfo from "./LikesInfo";
import { IoIosClose } from "react-icons/io";
import { useUser } from "@/content/profile/UserContext";

function LikesDeslikes({
  initialLikes,
  initialDislikes,
  proposalId,
  setErrorMsg,
  className
}) {
  const [clicked, setClicked] = useState(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [action, setAction] = useState(false);
  const { userData } = useUser();
  const backendUrl = userData?.activeBackend || process.env.NEXT_PUBLIC_API_URL;

  const voterType = userData?.species?.trim() || "human";

  const validateProfile = () => {
    const errors = [];
    if (!backendUrl) {
      errors.push("API base URL is not configured.");
    }
    if (!userData?.name) {
      errors.push("Add a display name in your profile before voting.");
    }

    if (errors.length > 0) {
      setErrorMsg(errors);
      return false;
    }

    if (!userData?.species) {
      setErrorMsg([
        "You haven't selected a species in your profile yet. We'll submit this vote as a human until you update it.",
      ]);
    }

    return true;
  };

  async function sendVote(choice) {
    try {
      const response = await fetch(`${backendUrl}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposal_id: proposalId,
          username: userData.name,
          choice: choice,
          voter_type: voterType,
        }),
      });

      if (!response.ok) {
        setErrorMsg([`Failed to send vote: ${response.statusText}`]);
        return false;
      }

      return true;
    } catch (error) {
      setErrorMsg([`Failed to send vote: ${error.message}`]);
      return false;
    }
  }

  async function removeVote() {
    try {
      const response = await fetch(
        `${backendUrl}/votes?proposal_id=${proposalId}&username=${userData.name}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setErrorMsg([`Failed to remove vote: ${response.statusText}`]);
        return false;
      }

      return true;
    } catch (error) {
      setErrorMsg([`Failed to remove vote: ${error.message}`]);
      return false;
    }
  }

  const handleLikeClick = async () => {
    if (!validateProfile()) return;

    if (clicked === "like") {
      const removed = await removeVote();
      if (removed) {
        setLikes(likes - 1);
        setClicked(null);
      }
    } else {
      const success = await sendVote("up");
      if (!success) return;
      if (clicked === "dislike") {
        setDislikes(dislikes - 1);
      }
      setLikes(likes + 1);
      setClicked("like");
    }
  };

  const handleDislikeClick = async () => {
    if (!validateProfile()) return;

    if (clicked === "dislike") {
      const removed = await removeVote();
      if (removed) {
        setDislikes(dislikes - 1);
        setClicked(null);
      }
    } else {
      const success = await sendVote("down");
      if (!success) return;
      if (clicked === "like") {
        setLikes(likes - 1);
      }
      setDislikes(dislikes + 1);
      setClicked("dislike");
    }
  };

  return (
    <>
      <div className="flex text-[var(--text-black)] bg-[var(--gray)] shadow-md w-fit gap-2 rounded-full px-1 py-1 items-center justify-between">
        <button
          onClick={handleLikeClick}
          style={{
            color: clicked === "like" ? "white" : "var(--text-black)",
            background: clicked === "like" ? "var(--pink)" : "transparent",
            boxShadow: clicked === "like" ? "var(--shadow-pink)" : "none",
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 py-0 h-[30px] cursor-pointer ${
            clicked === "like" ? "" : ""
          }`}
        >
          <BiSolidLike />
          <p className="h-fit">{likes}</p>
        </button>
        <button
          onClick={handleDislikeClick}
          style={{
            color: clicked === "dislike" ? "white" : "var(--text-black)",
            background: clicked === "dislike" ? "var(--blue)" : "transparent",
            boxShadow: clicked === "dislike" ? "var(--shadow-blue)" : "none",
          }}
          className={`flex items-center justify-center gap-1 rounded-full px-2 h-[30px] py-0 cursor-pointer ${
            clicked === "dislike" ? "" : ""
          }`}
        >
          <BiSolidDislike />
          <p className="h-fit">{dislikes}</p>
        </button>
        {action ? (
          <IoIosClose
            onClick={() => setAction(false)}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        ) : (
          <IoIosArrowUp
            onClick={() => setAction(true)}
            className="text-white rounded-full h-[30px] w-[30px] bg-[var(--transparent-gray)] cursor-pointer"
          />
        )}
      </div>
      <div className={`absolute ${className ? "-top-[-45px]" : "-top-55 md:-top-55 lg:-top-55 xl:-top-55"}`}>
        {action ? (
          <LikesInfo
            proposalId={proposalId}
          />
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default LikesDeslikes;
