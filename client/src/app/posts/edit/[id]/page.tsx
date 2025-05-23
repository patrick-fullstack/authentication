'use client';
import { use } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EditPostForm from '@/components/posts/EditPostForm';

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { id } = use(params);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
            </div>

            <EditPostForm postId={id} />
        </div>
    );
}