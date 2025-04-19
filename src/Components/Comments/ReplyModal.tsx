import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { Comment } from "../../models/Comments/Comment";
import { Toaster, toast } from "sonner";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, commentId: string) => void;
  userId: string;
  parentComment: Comment | null;
  replyCli: {
    validate: (userId: string, jwt: string | null) => Promise<boolean>;
  };
  jwt: string | null;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  userId,
  parentComment,
  replyCli, 
  jwt
}) => {
  const [replyContent, setReplyContent] = useState<string>("");
  const [canReply, setCanReply] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isValidating, setIsValidating] = useState<boolean>(true);

  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  // Calculate word count
  const wordCount = countWords(replyContent);
 
  // Reset reply content when modal opens/closes
  useEffect(() => {
    if (isOpen && userId) {
      setIsValidating(true);
      replyCli.validate(userId, jwt)
      .then(canReply => {
        setCanReply(canReply);
      })
      .catch(error => {
        console.error("Error validating reply eligibility:", error);
        toast.error("Couldn't verify your reply eligibility. Please try again later.");
        setCanReply(false);
      })
      .finally(() => {
        setIsValidating(false);
      });
      setReplyContent("");
      // Focus the textarea when the modal opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, userId, replyCli]);

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Default rows
      let rows = 4;
      
      if (wordCount > 60) {
        if (wordCount <= 250) {
          // Gradually increase rows based on word count, up to 250 words
          const additionalRows = Math.min((wordCount - 60) / 10, 12);
          rows += Math.floor(additionalRows);
        } else {
          // Max expansion at 250 words
          rows = 16; // 4 base rows + 12 additional = max expansion at 250 words
        }
      }
      
      textareaRef.current.rows = rows;
    }
  }, [replyContent, wordCount]);

  if (!isOpen || !parentComment) return null;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setReplyContent(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (replyContent.trim() === "") return;
    
    onSubmit(replyContent, parentComment.id);
    setReplyContent(""); // Clear the input
    onClose(); // Close the modal
    
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(10, 10, 15, 0.7)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-gray-950 border border-gray-800/50 rounded-xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 30px rgba(128, 90, 213, 0.25)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient border bottom */}
          <div className="relative flex justify-between items-center p-4 border-b border-gray-800/40">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            <h2 className="text-xl font-bold text-white">Reply to {parentComment.user_name}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-violet-300 transition-all duration-300 hover:rotate-90 p-1.5 rounded-full hover:bg-gray-800/60"
            >
              <X size={20} />
            </button>
          </div>

          {/* Parent comment container */}
          <div className="bg-gray-900/90 p-4">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-gray-400 border border-gray-800">
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
                {/* User Info */}
                <div className="flex items-center mb-1">
                  <span className="font-bold text-white">
                    {parentComment.user_name}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    @{parentComment.user_name.toLowerCase().replace(/\s+/g, '')} · {formatTimestamp(parentComment.created_at)}
                  </span>
                </div>
                {/* Comment Content */}
                <div className="text-white whitespace-pre-line mb-2">
                  {parentComment.content}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Show restriction message if user can't reply */}
            {!canReply && !isValidating && (
              <div className="bg-gray-900 rounded-lg overflow-hidden border-l-4 border-yellow-500">
                <div className="flex items-center p-3">
                  <Clock size={18} className="text-yellow-300 mr-3 flex-shrink-0" />
                  <p className="text-yellow-300 text-sm my-0">
                    You've already shared your thoughts today. Please return tomorrow to reply again.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={handleInputChange}
                  placeholder={canReply ? "Write your reply..." : "You can reply again tomorrow..."}
                  className={`w-full bg-gray-800/90 rounded-lg p-3 text-white placeholder-gray-500 border border-gray-700/60 outline-none resize-none overflow-y-auto transition-all duration-200 ${!canReply ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    maxHeight: wordCount > 250 ? '400px' : 'auto'
                  }}
                  rows={4}
                  autoFocus={canReply}
                  disabled={!canReply || isValidating}
                />
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </div>
                  <button
                    type="submit"
                    className={`${
                      canReply && !isValidating && replyContent.trim() !== ""
                        ? "bg-violet-600 hover:bg-violet-700"
                        : "bg-gray-700 cursor-not-allowed"
                    } text-white font-medium px-6 py-2 rounded-full transition-colors duration-200`}
                    disabled={replyContent.trim() === "" || !canReply || isValidating}
                  >
                    {isValidating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-t-2 border-white border-r-2 border-violet-800 rounded-full animate-spin"></div>
                        <span>Checking...</span>
                      </div>
                    ) : (
                      "Reply"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReplyModal;