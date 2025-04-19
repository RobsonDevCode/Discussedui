import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Toaster, toast } from "sonner";

interface ShareThoughtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  userId: string;
  topicTitle: string;
  commentCli: {
    validate: (userId: string, jwt: string | null) => Promise<boolean>;
  };
  jwt: string | null;
}

const ShareThoughtsModal: React.FC<ShareThoughtsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  topicTitle,
  commentCli,
  jwt,
}) => {
  const [newComment, setNewComment] = useState<string>("");
  const [canComment, setCanComment] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to count words in a string
  const countWords = (text: string): number => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  // Calculate word count
  const wordCount = countWords(newComment);

  // Check if user can comment when the modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setIsValidating(true);
      commentCli
        .validate(userId, jwt)
        .then((canComment) => {
          setCanComment(canComment);
        })
        .catch((error) => {
          console.error("Error validating comment eligibility:", error);
          toast.error(
            "Couldn't verify your comment eligibility. Please try again later."
          );
          setCanComment(false);
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [isOpen, userId, commentCli]);

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";

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
  }, [newComment, wordCount]);

  if (!isOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setNewComment(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (newComment.trim() === "" || !canComment) return;

    onSubmit(newComment);
    setNewComment(""); // Clear the input
    onClose(); // Close the modal

    toast.success("Your comment was submitted successfully!", {
      duration: 3000,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close the modal when clicking the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: "rgba(10, 10, 15, 0.7)",
          backdropFilter: "blur(8px)",
        }}
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
            <h2 className="text-xl font-bold text-white">
              Share your thoughts
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-violet-300 transition-all duration-300 hover:rotate-90 p-1.5 rounded-full hover:bg-gray-800/60"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-3 ">
            {/* Topic reminder - more defined with border */}
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <p className="text-sm text-gray-400 mb-1">Commenting on topic:</p>
              <p className="text-white font-medium">{topicTitle}</p>
            </div>

            {/* Show restriction message if user can't comment - closer to comment box */}
            {!canComment && !isValidating && (
              <div className="pt-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden border-l-4 border-yellow-500">
                  <div className="flex items-center p-3">
                    <Clock
                      size={18}
                      className="text-yellow-300 mr-3 flex-shrink-0"
                    />
                    <p className="text-yellow-300 text-sm my-0">
                      You've already shared your thoughts today. Please return
                      tomorrow to comment again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleInputChange}
                  placeholder={
                    canComment
                      ? "Share your thoughts on this topic..."
                      : "You can comment again tomorrow..."
                  }
                  className={`w-full bg-gray-800/90 rounded-lg p-3 text-white placeholder-gray-500 border border-gray-700/60 outline-none resize-none overflow-y-auto transition-all duration-200 ${
                    !canComment ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    maxHeight: wordCount > 250 ? "400px" : "auto",
                  }}
                  rows={4}
                  autoFocus={canComment}
                  disabled={!canComment || isValidating}
                />

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {wordCount} {wordCount === 1 ? "word" : "words"}
                  </div>
                  <button
                    type="submit"
                    className={`${
                      canComment && !isValidating && newComment.trim() !== ""
                        ? "bg-violet-600 hover:bg-violet-700"
                        : "bg-gray-700 cursor-not-allowed"
                    } text-white font-medium px-6 py-2 rounded-full transition-colors duration-200`}
                    disabled={
                      newComment.trim() === "" || !canComment || isValidating
                    }
                  >
                    {isValidating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-t-2 border-white border-r-2 border-violet-800 rounded-full animate-spin"></div>
                        <span>Checking...</span>
                      </div>
                    ) : (
                      "Comment"
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

export default ShareThoughtsModal;
