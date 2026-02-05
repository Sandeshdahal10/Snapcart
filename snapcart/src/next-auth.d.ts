/**
 * next-auth.d.ts
 * Module augmentation for "next-auth" to include application-specific
 * User properties (id and role) on the NextAuth User type so these
 * values are available on session and token objects.
 */
declare module "next-auth" {
  /**
   * Custom User fields available in session and token.
   */
  interface User {
    /** Unique identifier for the user (stringified ObjectId) */
    id: string;
    /** Display name */
    name: string;
    /** Email address */
    email: string;
    /** Application role (e.g. 'user' | 'admin' | 'deliveryBoy') */
    role: string;
  }
}

export {};