import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Clock,
  Repeat,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { CommentWithReplies } from "../../models/Comments/CommentWithReplies";
import ScrollableContent from "../../Components/Shared/ScrollableContent";
import { Comment } from "../../models/Comments/Comment";
import { useNavigate } from "react-router-dom";

interface CommentThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentWithReplies: CommentWithReplies | null;
  userId: string | null;
  onLike: (commentId: string, isReply?: boolean) => void;
  onRepost: (comment: Comment) => void;
  onReply: (content: string, commentId: string) => void;
  replyCli: {
    validate: (userId: string, jwt: string | null) => Promise<boolean>;
  };
  jwt: string | null;
}

const CommentThreadModal: React.FC<CommentThreadModalProps> = ({
  isOpen,
  onClose,
  commentWithReplies,
  userId,
  onLike,
  onReply,
  replyCli,
  jwt,
}) => {
  const [newReply, setNewReply] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [canReply, setCanReply] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset state when opening a new comment
    if (isOpen && userId) {
      setIsValidating(true);
      replyCli
        .validate(userId, jwt)
        .then((canReply) => {
          setCanReply(canReply);
        })
        .catch((error) => {
          console.error("Error validating comment eligibility:", error);
          toast.error(
            "Couldn't verify your reply eligibility. Please try again later."
          );
          setCanReply(false);
        })
        .finally(() => {
          setIsValidating(false);
        });
      setNewReply("");
      setExpandedReplies(true);
    } else {
      setCanReply(false);
    }
  }, [isOpen, commentWithReplies?.comment.id]);

  if (!isOpen || !commentWithReplies || !commentWithReplies.comment)
    return null;

  // Ensure replies is always an array, even if null or undefined
  const replies = commentWithReplies.replies || [];
  const replyCount = replies.length;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReply.trim() === "") return;

    onReply(newReply, commentWithReplies.comment.id);
    setNewReply("");
    toast.success("Reply posted successfully!", {
      duration: 3000,
    });
  };

  const formatTimestamp = (createdAt: Date): string => {
    return createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleReplies = () => {
    setExpandedReplies(!expandedReplies);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ 
          backgroundColor: "rgba(10, 10, 15, 0.7)", 
          backdropFilter: "blur(8px)" 
        }}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-gray-950 border border-gray-800/50 rounded-xl w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{
            boxShadow: "0 4px 30px rgba(128, 90, 213, 0.25)",
            transform: "scale(1.0)",
            transition: "transform 0.2s ease, box-shadow 0.3s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header with gradient line */}
          <div className="relative flex justify-between items-center p-4 border-b border-gray-800/40 sticky top-0 bg-gray-950 z-10">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            <h2 className="text-xl font-bold text-white">Comment Thread</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-violet-300 transition-all duration-300 hover:rotate-90 p-1.5 rounded-full hover:bg-gray-800/60"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content area using our component */}
          <ScrollableContent
            className="flex-grow bg-gray-950"
            enableScrollOnCondition={replyCount > 2}
          >
            {/* Original Comment with enhanced styling */}
            <div className="p-5 border-b border-gray-800/20">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-gray-400 border border-violet-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="font-bold text-white">
                      {commentWithReplies.comment.user_name}
                    </span>
                    <span className="ml-2 text-sm text-gray-400">
                      {formatTimestamp(commentWithReplies.comment.created_at)}
                    </span>
                  </div>
                  <div className="text-white mb-4 whitespace-pre-line leading-relaxed">
                    {commentWithReplies.comment.content}
                  </div>

                  {/* Comment Interactions - Enhanced styling */}
                  <div className="flex items-center space-x-6 text-gray-400">
                    <button
                      className={`flex items-center space-x-2 group transition-colors duration-200 ${
                        commentWithReplies.comment.user_interactions.user_liked
                          ? "text-red-500"
                          : "hover:text-red-400"
                      }`}
                      onClick={() => onLike(commentWithReplies.comment.id)}
                    >
                      <Heart
                        size={18}
                        fill={
                          commentWithReplies.comment.user_interactions
                            .user_liked
                            ? "currentColor"
                            : "none"
                        }
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      <span>
                        {commentWithReplies.comment.user_interactions.likes}
                      </span>
                    </button>
                    <button
                      className="flex items-center space-x-2 group hover:text-violet-400 transition-colors duration-200"
                      onClick={() => replyInputRef.current?.focus()}
                    >
                      <MessageCircle
                        size={18}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      <span>{replyCount}</span>
                    </button>

                    <button className="flex items-center space-x-2">
                      <Repeat size={18} className="text-green-500" />
                      <span className="text-sm text-green-500">
                        {commentWithReplies.comment.user_interactions.reposts >
                        0
                          ? commentWithReplies.comment.user_interactions.reposts
                          : ""}
                      </span>
                    </button>
                    <button className="ml-auto hover:text-gray-200 transition-colors duration-200 p-1 hover:bg-gray-800/40 rounded-full">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies Section - Enhanced with gradient */}
            <div className="relative px-5 py-3 border-b border-gray-800/20">
              <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"></div>
              <button
                className="flex items-center text-violet-400 hover:text-violet-300 transition-colors duration-200 font-medium"
                onClick={toggleReplies}
              >
                <span>
                  {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
                </span>
                {expandedReplies ? (
                  <ChevronUp
                    size={16}
                    className="ml-1 transition-transform duration-200"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="ml-1 transition-transform duration-200"
                  />
                )}
              </button>
            </div>

            {/* Replies List with enhanced styling */}
            {expandedReplies && (
              <div className="divide-y divide-gray-800/10">
                {replyCount > 0 ? (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-5 pl-14 hover:bg-gray-900/30 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-gray-400 border border-violet-500/10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-bold text-white">
                              {reply.user_name}
                            </span>
                            <span className="ml-2 text-sm text-gray-400">
                              {formatTimestamp(reply.created_at)}
                            </span>
                          </div>
                          <div className="text-white mb-3 whitespace-pre-line leading-relaxed">
                            {reply.content}
                          </div>

                          {/* Reply Interactions - Enhanced */}
                          <div className="flex items-center space-x-6 text-gray-400">
                            <button
                              className={`flex items-center space-x-2 group transition-colors duration-200 ${
                                reply.interactions.user_liked
                                  ? "text-red-500"
                                  : "hover:text-red-400"
                              }`}
                              onClick={() => onLike(reply.id, true)}
                            >
                              <Heart
                                size={16}
                                fill={
                                  reply.interactions.user_liked
                                    ? "currentColor"
                                    : "none"
                                }
                                className="transition-transform duration-200 group-hover:scale-110"
                              />
                              <span>{reply.interactions.likes}</span>
                            </button>
                            {canReply && (
                              <button
                                className="flex items-center space-x-2 group hover:text-violet-400 transition-colors duration-200"
                                onClick={() => {
                                  setNewReply(`@${reply.user_name} `);
                                  replyInputRef.current?.focus();
                                }}
                              >
                                <MessageCircle
                                  size={16}
                                  className="transition-transform duration-200 group-hover:scale-110"
                                />
                                <span>Reply</span>
                              </button>
                            )}
                            <button className="ml-auto hover:text-gray-200 transition-colors duration-200 p-1 hover:bg-gray-800/40 rounded-full">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-5 text-center text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800/60 flex items-center justify-center">
                      <MessageCircle
                        size={24}
                        className="text-violet-400"
                      />
                    </div>
                    <p className="font-medium">
                      No replies yet. {canReply ? "Be the first to reply!" : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollableContent>

          {/* Footer area - Enhanced UI for all states */}
          {!canReply && userId ? (
            <div className="border-t border-gray-800/50 bg-gray-900/70 shadow-lg">
              <div className="p-4 flex items-center text-yellow-300">
                <div className="w-8 h-8 rounded-full bg-yellow-950/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <Clock size={16} />
                </div>
                <p className="text-sm flex-1 my-0">
                  You've already shared your thoughts today. Please return
                  tomorrow to reply again.
                </p>
              </div>
            </div>
          ) : !userId || userId === "" ? (
            <div className="border-t border-gray-800/50 bg-gray-900/70 shadow-lg">
              <div className="p-5 flex justify-center w-full">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-violet-900/30 transform hover:translate-y-px"
                >
                  Login to join the conversation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gray-950 border-t border-gray-800/50 shadow-lg">
              <form
                onSubmit={handleReplySubmit}
                className="flex items-start space-x-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-gray-400 border border-violet-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <textarea
                    ref={replyInputRef}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Share your thoughts on this topic..."
                    className="w-full bg-gray-800/50 rounded-lg p-3 text-white placeholder-gray-500 border border-gray-700/40 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 outline-none resize-none overflow-y-auto transition-all duration-200"
                    autoFocus
                    disabled={isValidating}
                    rows={2}
                  />
                  <div className="flex justify-between mt-3 items-center">
                    <div className="text-xs text-gray-500">
                      {newReply.length} / 500
                    </div>
                    <button
                      type="submit"
                      disabled={newReply.trim() === "" || isValidating}
                      className={`${
                        newReply.trim() === "" || isValidating
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 shadow-lg shadow-violet-900/30"
                      } text-white font-medium px-5 py-2.5 rounded-full transition-all duration-300 transform hover:translate-y-px`}
                    >
                      {isValidating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-t-2 border-white border-r-2 border-violet-800 rounded-full animate-spin"></div>
                          <span>Posting...</span>
                        </div>
                      ) : (
                        "Reply"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentThreadModal;