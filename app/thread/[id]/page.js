"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { usePosts } from "../../context/PostsContext";
import PostCard from "../../components/PostCard";
import CommentDock from "../../components/CommentDock";
import Link from "next/link";

export default function ThreadPage() {
    const params = useParams();
    const { posts } = usePosts();
    const [replyTo, setReplyTo] = useState(null);

    // Parse ID. If coming from URL it's string, data is number usually (or string).
    // Initial mocked posts are numbers, new ones are timestamps (numbers).
    // Params.id is string.
    const id = Number(params.id);
    const post = posts.find((p) => p.id === id);

    if (!post) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, marginBottom: 10 }}>Post not found</h2>
                <Link href="/" style={{ color: 'var(--text-secondary)' }}>Back to Feed</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "200px" }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 10, marginBottom: 10 }}>
                <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>← Back</Link>
            </div>

            {/* Main Post - Reusing PostCard but could be more detailed */}
            <PostCard {...post} onReply={setReplyTo} activeReplyId={replyTo?.id} />

            {/* Dock for adding comments */}
            <CommentDock
                postId={post.id}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />
        </div>
    );
}
