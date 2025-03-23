import React, { useState, useRef, useEffect } from "react";
import { X, Heart, MessageCircle, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { Toaster, toast } from "sonner";
import { CommentWithReplies } from "../../models/Comments/CommentWithReplies";

interface CommentThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentWithReplies: CommentWithReplies | null;
  userId: string;
  onLike: (commentId: string, isReply?: boolean) => void;
  onReply: (commentId: string, content: string) => void;
  onShare: (commentId: string) => void;
}

const CommentThreadModal: React.FC<CommentThreadModalProps> = ({
  isOpen,
  onClose,
  commentWithReplies,
  userId,
  onLike,
  onReply,
  onShare
}) => {
  const [newReply, setNewReply] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<boolean>(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Reset state when opening a new comment
    if (isOpen) {
      setNewReply("");
      setExpandedReplies(true);
    }
  }, [isOpen, commentWithReplies?.comment.id]);

  if (!isOpen || !commentWithReplies || !commentWithReplies.comment) return null;

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
    
    onReply(commentWithReplies.comment.id, newReply);
    setNewReply("");
    toast.success("Reply posted successfully!", {
      duration: 3000,
    });
  };

  const formatTimestamp = (createdAt: Date): string => {
    return createdAt.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleReplies = () => {
    setExpandedReplies(!expandedReplies);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div
        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(15, 15, 15, 0.7)' }}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-slate-950 rounded-xl w-full max-w-4xl mx-4 border border-gray-700 shadow-2xl max-h-[90vh] flex flex-col"
          style={{ backgroundColor: 'rgb(0, 0, 0)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 bg-black z-10">
            <h2 className="text-xl font-bold text-white">Comment Thread</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow">
            {/* Original Comment */}
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-white">{commentWithReplies.comment.user_name}</span>
                    <span className="ml-2 text-sm text-gray-400">
                      {formatTimestamp(commentWithReplies.comment.created_at)}
                    </span>
                  </div>
                  <div className="text-white mb-4 whitespace-pre-line">
                    {commentWithReplies.comment.content}
                  </div>
                  
                  {/* Comment Interactions */}
                  <div className="flex items-center space-x-6 text-gray-400">
                    <button 
                      className={`flex items-center space-x-2 hover:text-white transition-colors ${commentWithReplies.comment.user_interactions.user_liked ? 'text-violet-500' : ''}`}
                      onClick={() => onLike(commentWithReplies.comment.id)}
                    >
                      <Heart size={18} fill={commentWithReplies.comment.user_interactions.user_liked ? "currentColor" : "none"} />
                      <span>{commentWithReplies.comment.user_interactions.likes}</span>
                    </button>
                    <button 
                      className="flex items-center space-x-2 hover:text-white transition-colors"
                      onClick={() => replyInputRef.current?.focus()}
                    >
                      <MessageCircle size={18} />
                      <span>{replyCount}</span>
                    </button>
                    <button className="ml-auto hover:text-white transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            <div className="px-5 py-3 border-b border-gray-800">
              <button 
                className="flex items-center text-violet-500 hover:text-violet-400 transition-colors mb-2"
                onClick={toggleReplies}
              >
                <span className="font-bold">{replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
                {expandedReplies ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>
            </div>

            {/* Replies List */}
            {expandedReplies && (
              <div className="divide-y divide-gray-800">
                {replyCount > 0 ? (
                  replies.map((reply) => (
                    <div key={reply.id} className="p-5 pl-14">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-bold text-white">{reply.username}</span>
                            <span className="ml-2 text-sm text-gray-400">
                              {formatTimestamp(reply.created_at)}
                            </span>
                          </div>
                          <div className="text-white mb-3 whitespace-pre-line">
                            {reply.content}
                          </div>
                          
                          {/* Reply Interactions */}
                          <div className="flex items-center space-x-6 text-gray-400">
                            <button 
                              className={`flex items-center space-x-2 hover:text-white transition-colors ${reply.interactions.liked ? 'text-violet-500' : ''}`}
                              onClick={() => onLike(reply.id, true)}
                            >
                              <Heart size={16} fill={reply.interactions.liked ? "currentColor" : "none"} />
                              <span>{reply.interactions.likes}</span>
                            </button>
                            <button 
                              className="flex items-center space-x-2 hover:text-white transition-colors"
                              onClick={() => {
                                setNewReply(`@${reply.username} `);
                                replyInputRef.current?.focus();
                              }}
                            >
                              <MessageCircle size={16} />
                              <span>Reply</span>
                            </button>
                            <button className="ml-auto hover:text-white transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-center text-gray-400">
                    <p>No replies yet. Be the first to reply!</p>
                  </div>
                )}
              </div>
            )}

            {/* Reply Input */}
            <div className="p-5 sticky bottom-0 bg-black border-t border-gray-800">
              <form onSubmit={handleReplySubmit} className="flex items-start space-x-4">
                <div className="flex-1">
                  <textarea
                    ref={replyInputRef}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 border-none outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={newReply.trim() === ""}
                      className={`${
                        newReply.trim() === "" 
                          ? "bg-gray-700 cursor-not-allowed" 
                          : "bg-violet-700 hover:bg-violet-800"
                      } text-white font-bold px-4 py-2 rounded-full transition-colors`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentThreadModal;