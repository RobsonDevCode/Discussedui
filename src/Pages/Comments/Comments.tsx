import { ChangeEvent, useState, useEffect } from "react";
import { Comment } from "../../models/Comments/Comment";
import { UserInteractions } from "../../models/Comments/UserInteractions";
import { Heart, MessageCircle, Repeat, Share2 } from "lucide-react";
import { isProblemDetails, UseCommentClient } from "../../Sevices/Comments/CommentsClient";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Like } from "../../models/Comments/Like";
import ShareThoughtsModal from "../../Components/Comments/ShareYourThoughtsModal";
import { PostComment } from "../../models/Comments/PostComment";
import { useTokenClient } from "../../Sevices/Login/TokenClient";

// Define tab types
type TabType = "for-you" | "following" | "top-comments";

const Comments: React.FC = () => {
   
    const navigate = useNavigate();
   
    //Clients
    const tokenCli = useTokenClient();
    const commentCli = UseCommentClient();

    // Active tab state
    const [activeTab, setActiveTab] = useState<TabType>("for-you");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //Topic 
    const [topic, setTopic] = useState<string>("Test Topic");
    
    // Comments state for each tab
    const [comments, setComments] = useState<Comment[]>([]);
    const [followingComments, setFollowingComments] = useState<Comment[]>([]);
    const [topComments, setTopComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

    // Pagination state
    const [visibleCount, setVisibleCount] = useState<number>(25);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const BATCH_SIZE = 25;

    //Location
    const location = useLocation();

    //Auth 
    const [jwt, setJwt]= useState<string | null>(null);

    const setAuth = async() => {
       setJwt(await getJwt(userId))
    };

    var userId = location.state?.userId;
    const newinteraction: UserInteractions = {
        user_id: "fdkfjdklflk-34rkjkle-5",
        user_liked: false,
        likes: 0,
        reply_count: 0,
        reposts: 0,
        last_interaction: new Date()
    }

    const getJwt = async(userId: string  | null): Promise<string | null> => {
        if(jwt !== null){
            return jwt;
        }
        else if((userId !== null && userId !== undefined) && jwt === null){
            return await tokenCli.getJwt(userId, "id") ;
        }else{
            return null;
        }
    }

    // Fetch comments when tab changes
    useEffect(() => {
        setAuth();

        const fetchData = async () => {
            setIsLoading(true);
            // Reset visible count when changing tabs
            setVisibleCount(BATCH_SIZE);
            setHasMore(true);

            try {
                switch (activeTab) {
                    case "for-you":
                        const forYouResponse = await commentCli.getComments(userId);
                        setComments(forYouResponse);
                        setHasMore(forYouResponse.length > BATCH_SIZE);
                        break;
                    case "following":
                        // For now empty or implement your follow logic
                        const followingComments = await commentCli.getFollowingComments(userId);
                        setFollowingComments(followingComments);
                        setHasMore(followingComments.length > BATCH_SIZE);
                        break;
                    case "top-comments":
                        // Fetch and sort by likes
                        const topComments = await commentCli.getTopComments();
                        setTopComments(topComments);
                        setHasMore(topComments.length > BATCH_SIZE);
                        break;
                }
            } catch (error: unknown) {
                setIsLoading(false);
                if (isProblemDetails(error)) {
                    // Handle structured API errors (ProblemDetails)
                    const problemDetails = error.response?.data;
                    console.log(problemDetails?.detail || problemDetails?.title || "An error occurred on our side, we're sorry for the inconvenience.");
                } else if (error instanceof AxiosError) {
                    // Handle other types of Axios errors
                    if (error.response) {
                        // Server responded with a status code outside of 2xx
                        console.log(error.response.data?.detail || "An error occurred on our side, we're sorry for the inconvenience.");
                    } else if (error.request) {
                        // Request was made but no response received
                        console.log("Unable to connect to the server. Please check your internet connection.");
                    } else {
                        // Error setting up the request
                        console.log("An unexpected error occurred. Please try again.");
                    }
                } else if (error instanceof Error) {
                    // Handle regular JavaScript errors
                    console.log(error.message || "An unexpected error occurred. Please try again.");
                } else {
                    // Handle unknown error types
                    console.log("An unexpected error occurred. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeTab]); // Re-fetch when tab changes

    // Handle comment submission
    const handleSubmitComment = async (commentContent: string) => {
        if (commentContent.trim() === "") return;

        const postComment: PostComment = {
            topic_id: topic,
            user_id: userId,
            content: commentContent
        };

        try{
        const comment = await commentCli.postComment(postComment, jwt)
        switch (activeTab) {
            case "for-you":
                setComments([comment, ...comments]);
                break;
            case "following":
                setFollowingComments([comment, ...followingComments]);
                break;
            case "top-comments":
                setTopComments([comment, ...topComments]);
                break;
        }
        }catch(error: unknown){
            navigate('/error');
            console.log(error);
        }

        // Add new comment to the active tab's comments array
        
    };

    // Format date to readable string
    const formatDate = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString(undefined, options);
    };

    function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>): void {
        setNewComment(e.target.value);
    }

    // Implementation for the handleLike function
    const handleLike = async (comment: Comment) => {
        try {
            // Create a copy of the comment for optimistic UI update
            const commentToUpdate = { ...comment };

            // Toggle the like status
            const newLikedStatus = !commentToUpdate.user_interactions.user_liked;

            // Update like count based on new status
            const newLikeCount = newLikedStatus
                ? commentToUpdate.user_interactions.likes + 1
                : commentToUpdate.user_interactions.likes - 1;

            // Update the comment in UI immediately (optimistic update)
            const updatedComments = getCurrentComments().map(c => {
                if (c.id === comment.id) {
                    return {
                        ...c,
                        user_interactions: {
                            ...c.user_interactions,
                            user_liked: newLikedStatus,
                            likes: newLikeCount,
                            last_interaction: new Date()
                        }
                    };
                }
                return c;
            });

            // Update the correct comment list based on active tab
            switch (activeTab) {
                case "for-you":
                    setComments(updatedComments);
                    break;
                case "following":
                    setFollowingComments(updatedComments);
                    break;
                case "top-comments":
                    setTopComments(updatedComments);
                    break;
            }

            const like: Like = {
                comment_id: comment.id,
                user_id: userId
            }

            var response;

            if (newLikeCount > commentToUpdate.user_interactions.likes) {
                response = await commentCli.likeComment(like);
            } else {
                response = await commentCli.dislikeComment(like);
            }


            // If server response fails, revert the optimistic update
            if (!response || response.status !== 200) {
                // Revert to original state if API fails
                const revertedComments = getCurrentComments().map(c => {
                    if (c.id === comment.id) {
                        return comment; // Original comment state
                    }
                    return c;
                });

                switch (activeTab) {
                    case "for-you":
                        setComments(revertedComments);
                        break;
                    case "following":
                        setFollowingComments(revertedComments);
                        break;
                    case "top-comments":
                        setTopComments(revertedComments);
                        break;
                }
            }
        } catch (error: unknown) {
            // Handle errors similar to your existing error handling
            if (isProblemDetails(error)) {
                const problemDetails = error.response?.data;
                console.log(problemDetails?.detail || problemDetails?.title || "An error occurred while liking the comment.");
            } else if (error instanceof AxiosError) {
                if (error.response) {
                    console.log(error.response.data?.detail || "An error occurred while liking the comment.");
                } else if (error.request) {
                    console.log("Unable to connect to the server. Please check your internet connection.");
                } else {
                    console.log("An unexpected error occurred. Please try again.");
                }
            } else if (error instanceof Error) {
                console.log(error.message || "An unexpected error occurred. Please try again.");
            } else {
                console.log("An unexpected error occurred. Please try again.");
            }
        }
    };

    // Get the current comments based on active tab
    const getCurrentComments = () => {
        switch (activeTab) {
            case "for-you":
                visibleComments = [];
                return comments;
            case "following":
                visibleComments = [];
                return followingComments;
            case "top-comments":
                visibleComments = [];
                return topComments;
            default:
                visibleComments = [];
                return comments;
        }
    };

    // Handle load more button click
    const handleLoadMore = () => {
        const allComments = getCurrentComments();
        const nextVisibleCount = visibleCount + BATCH_SIZE;

        setVisibleCount(nextVisibleCount);

        // Check if we have more comments to load
        if (nextVisibleCount >= allComments.length) {
            setHasMore(false);
        }
    };

    // Get only the visible comments
    var visibleComments = getCurrentComments().slice(0, visibleCount);

    return (
        <div className="w-full h-full bg-inherit">
            {/* Topic Header */}
            <div className="rounded-b-lg flex flex-col items-center justify-center border border-gray-700 shadow-lg p-4 mx-auto max-w-4xl text-center">
                <h1 className="text-2xl font-bold text-white">Today's topic:</h1>
                <p className="text-2xl text-white">{topic}</p>
            </div>

            {/* Main content area */}
            <div className="max-w-4xl mx-auto border-l border-r border-gray-700 bg-opacity-70" style={{ backdropFilter: 'blur(5px)' }}>
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "for-you" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("for-you")}
                    >
                        For You
                        {activeTab === "for-you" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "following" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("following")}
                    >
                        Following
                        {activeTab === "following" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "top-comments" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("top-comments")}
                    >
                        Top Comments
                        {activeTab === "top-comments" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                </div>

                {/* Comment Button */}
                <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-10 rounded-full bg-gray-600"></div>
                        {(userId !== null && userId !== undefined)? (   <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="text-gray-400 hover:text-white w-full text-left"
                        >
                            Share your thoughts on this topic...
                        </button>): 

                        (<button className="text-gray-400 hover:text-white w-full text-left" 
                        onClick={() => navigate('/login')}
                        >Login to share your thoughts on the topic...</button>)
                        }
                       
                    </div>

                    {(userId !== null && userId !== undefined) ? (
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                        >
                            Comment
                        </button>
                    ) : 
                    (
                        <button
                        onClick={() => navigate('/login')}
                        className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                    >
                        Login
                    </button>
                    )}
                </div>

                {/* Comments Feed */}
                <div>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>Loading comments...</p>
                        </div>
                    ) : visibleComments.length > 0 ? (
                        <>
                            {visibleComments.map((comment) => (
                                <div key={comment.id} className="p-4 border-b border-gray-700 hover:bg-gray-900 hover:bg-opacity-50 transition-colors duration-200">
                                    <div className="flex space-x-3">
                                        {/* User Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>

                                        <div className="flex-1">
                                            {/* User Info and Comment Time */}
                                            <div className="flex items-center space-x-1">
                                                <span className="font-bold text-white">{comment.user_name}</span>
                                                <span className="text-gray-400">@{comment.user_name.toLowerCase()}</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                                            </div>

                                            {/* Comment Content */}
                                            <div className="mt-1 mb-2">
                                                <p className="text-white">{comment.content}</p>
                                            </div>

                                            {/* Comment Actions */}
                                            <div className="flex justify-between max-w-md text-gray-400">
                                                {/* Reply */}
                                                <button className="flex items-center space-x-1 group">
                                                    <MessageCircle size={18} className="group-hover:text-blue-400" />
                                                    <span className="text-xs group-hover:text-blue-400">
                                                        {comment.user_interactions.reply_count > 0 ? comment.user_interactions.reply_count : ''}
                                                    </span>
                                                </button>

                                                {/* Repost */}
                                                <button className="flex items-center space-x-1 group">
                                                    <Repeat size={18} className="group-hover:text-green-400" />
                                                    <span className="text-xs group-hover:text-green-400">
                                                        {comment.user_interactions.reposts > 0 ? comment.user_interactions.reposts : ''}
                                                    </span>
                                                </button>

                                                {/* Like */}
                                                <button
                                                    className="flex items-center space-x-1 group"
                                                    onClick={() => handleLike(comment)}
                                                >
                                                    <Heart
                                                        size={18}
                                                        className={`${comment.user_interactions.user_liked ? 'text-red-500 fill-red-500' : 'group-hover:text-red-400'}`}
                                                    />
                                                    <span className={`text-xs ${comment.user_interactions.user_liked ? 'text-red-500' : 'group-hover:text-red-400'}`}>
                                                        {comment.user_interactions.likes > 0 ? comment.user_interactions.likes : ''}
                                                    </span>
                                                </button>

                                                {/* Share */}
                                                <button className="flex items-center space-x-1 group">
                                                    <Share2 size={18} className="group-hover:text-blue-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="p-4 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                                    >
                                        Load More Comments
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 text-gray-400 text-center border-b border-gray-700 hover:bg-gray-900 hover:bg-opacity-50 transition-colors duration-200">
                            {activeTab === "for-you" ? (
                                <p>No comments to show. Be the first to comment!</p>
                            ) : activeTab === "following" ? (
                                <p>No comments from people you follow yet.</p>
                            ) : (
                                <p>No top comments to show yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal component */}
            <ShareThoughtsModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onSubmit={handleSubmitComment}
                userId={userId || ""}
                topicTitle={topic}
            />
        </div>
    );
}

export default Comments;