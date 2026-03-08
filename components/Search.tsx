'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('query') ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set('query', query);
            } else {
                params.delete('query');
            }
            router.push(`?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a97e]"
            />
        </div>
    );
};

export default Search;
