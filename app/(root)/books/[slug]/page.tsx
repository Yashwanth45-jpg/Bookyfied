import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import { getBookBySlug } from "@/lib/actions/book.actions";
import VapiControls from "@/components/VapiControls";

interface BookDetailsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const { slug } = await params;
    const result = await getBookBySlug(slug);

    if (!result.success || !result.data) {
        redirect("/");
    }

    const book = result.data;

    return (

        <div className="book-page-container">
            {/* Floating back button */}
            <Link href="/" className="back-btn-floating">
                <ArrowLeft className="size-5 text-(--text-primary)" />
            </Link>

            {/* Transcript area */}
            <VapiControls book={book} />
        </div>
    );
}
