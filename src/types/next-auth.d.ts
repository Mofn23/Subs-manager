import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    currency?: string;
    monthlyBudget?: number | null;
    onboarded?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      currency: string;
      monthlyBudget: number | null;
      onboarded: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    currency?: string;
    monthlyBudget?: number | null;
    onboarded?: boolean;
  }
}
