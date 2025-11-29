import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronUp, X } from 'lucide-react';
import { LikesInfo } from "./LikesInfo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface LikesDeslikesProps {
    initialLikes: number;
    initialDislikes: number;
    proposalId: number;
    setErrorMsg?: (msg: string | null) => void;
    className?: string;
}

export const LikesDeslikes: React.FC<LikesDeslikesProps> = ({
    initialLikes,
    initialDislikes,
    proposalId,
    setErrorMsg,
    className
}) => {
    const [clicked, setClicked] = useState<'like' | 'dislike' | null>(null);
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [action, setAction] = useState(false);
    const { user } = useAuth();

    const validateProfile = () => {
        if (!user) {
            if (setErrorMsg) setErrorMsg("You must be logged in to vote.");
            return false;
        }
        return true;
    };

    async function sendVote(choice: 'up' | 'down') {
        if (!user) return false;
        try {
            await api.voteProposal(proposalId, choice, user.species, user.username);
            return true;
        } catch (error: any) {
            if (setErrorMsg) setErrorMsg(`Failed to send vote: ${error.message}`);
            return false;
        }
    }

    async function removeVote() {
        if (!user) return false;
        try {
            await api.removeVote(proposalId, user.username);
            return true;
        } catch (error: any) {
            if (setErrorMsg) setErrorMsg(`Failed to remove vote: ${error.message}`);
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
                ) : (
    ""
)}
            </div >
        </>
    );
};
