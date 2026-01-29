"use client";
import { useState, useRef, useEffect } from "react";
import PostCard from "./PostCard";
import CommentDock from "./CommentDock";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

import { useSession } from "next-auth/react";

export default function Feed() {
    const { posts } = usePosts();
    const { data: session } = useSession();
    const { user } = useUser(); // Get user preferences
    const [currentIndex, setCurrentIndex] = useState(0);
    const [replyTo, setReplyTo] = useState(null);

    // Filter posts based on language
    const filteredPosts = posts.filter(post => {
        if (!session || !user || !user.languages) return true; // Show all to guests or incomplete profiles

        // Assuming post has a 'language' property. 
        // If posts don't have language, we might need to mock it or assume 'english'
        // For now, let's filter IF the post has a language property.
        if (!post.language) return true;

        // user.languages is { english: true, german: false }
        return user.languages[post.language];
    });

    const currentPost = filteredPosts[currentIndex];
    const isGuest = !session;

    // Reset reply state if post changes
    // (Note: Hooks run on every render. If currentIndex changes, we might want to useEffect to reset logic, 
    // or just reset it when we change index handlers)
    // useEffect is cleaner for "reaction to change".
    // But handlers are fine too.

    const handleNext = () => {
        if (currentIndex < posts.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setReplyTo(null);
        } else {
            // Loop back or stop? "Users can tap or swipe... to look at a new post"
            // Let's loop for endless feel or just stop. 
            // Stop is better UX usually, but loop is "avant garde". Let's stop for now.
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setReplyTo(null);
        }
    };

    // Touch & Mouse Handling
    const touchStart = useRef({ x: 0, y: 0 });
    const touchEnd = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    const minSwipeDistance = 50;

    const handleInputStart = (clientX, clientY) => {
        isDragging.current = true;
        touchEnd.current.x = 0; // Reset
        touchStart.current.x = clientX;
        touchStart.current.y = clientY;
    };

    const handleInputMove = (clientX, clientY) => {
        if (!isDragging.current) return;
        touchEnd.current.x = clientX;
        touchEnd.current.y = clientY;
    };

    const handleInputEnd = () => {
        isDragging.current = false;
        // Check if move occurred
        if (!touchEnd.current.x) {
            // Tap
            const width = window.innerWidth;
            const x = touchStart.current.x;
            if (x < width * 0.5) handlePrev();
            else handleNext();
            return;
        }

        const distanceX = touchStart.current.x - touchEnd.current.x;
        const distanceY = touchStart.current.y - touchEnd.current.y;
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
            if (distanceX > 0) {
                // Swiped Left -> Next
                handleNext();
            } else {
                // Swiped Right -> Prev
                handlePrev();
            }
        } else {
            // Tap fallback
            if (Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10) {
                const width = window.innerWidth;
                const x = touchStart.current.x;
                if (x < width * 0.5) handlePrev();
                else handleNext();
            }
        }
    };

    const onTouchStart = (e) => handleInputStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    const onTouchMove = (e) => handleInputMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    const onTouchEnd = (e) => handleInputEnd();

    const onMouseDown = (e) => handleInputStart(e.clientX, e.clientY);
    const onMouseMove = (e) => handleInputMove(e.clientX, e.clientY);
    const onMouseUp = (e) => handleInputEnd();
    const onMouseLeave = (e) => {
        if (isDragging.current) {
            handleInputEnd();
        }
    };

    if (!currentPost) return <div style={{ padding: 20 }}>LOADING...</div>;

    return (
        <div
            style={{
                height: "100%", // Fit container
                width: "100%",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "pan-y" // Allow vertical scroll, disable browser horizontal swipe nav if possible
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            {/* Progress Bar (optional but good for deck view) */}
            <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${((currentIndex + 1) / posts.length) * 100}%`,
                height: 4, background: 'var(--accent)', transition: 'width 0.3s'
            }} />

            {/* Top Navigation Overlay Removed per request (hierarchy shift) */}


            <PostCard
                key={currentPost.id}
                {...currentPost}
                onReply={setReplyTo}
                activeReplyId={replyTo?.id}
                isGuest={isGuest}
            />

            {!isGuest && (
                <CommentDock
                    key={`dock-${currentPost.id}`}
                    postId={currentPost.id}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            )}
        </div>
    );
}
