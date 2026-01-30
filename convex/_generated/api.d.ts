/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as campaigns from "../campaigns.js";
import type * as chats from "../chats.js";
import type * as http from "../http.js";
import type * as onboarding from "../onboarding.js";
import type * as portfolio from "../portfolio.js";
import type * as social from "../social.js";
import type * as statistics from "../statistics.js";
import type * as studio from "../studio.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  campaigns: typeof campaigns;
  chats: typeof chats;
  http: typeof http;
  onboarding: typeof onboarding;
  portfolio: typeof portfolio;
  social: typeof social;
  statistics: typeof statistics;
  studio: typeof studio;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
