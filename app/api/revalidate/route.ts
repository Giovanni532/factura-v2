import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const tag = request.nextUrl.searchParams.get('tag');

    if (!tag) {
        return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 });
    }

    try {
        revalidateTag(tag);
        return NextResponse.json({ revalidated: true, tag });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
    }
} 