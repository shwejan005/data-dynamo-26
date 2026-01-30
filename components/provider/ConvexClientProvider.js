'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import React from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!convexUrl) console.warn('⚠️ Missing NEXT_PUBLIC_CONVEX_URL');
if (!clerkKey) console.warn('⚠️ Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClerkProvider({ children }) {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
