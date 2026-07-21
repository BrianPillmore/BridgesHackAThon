import { NextResponse } from "next/server";

import { getServerEnvironment } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export function GET() {
  const environment = getServerEnvironment();

  return NextResponse.json(
    {
      status: "ok",
      service: process.env.npm_package_name ?? "public-meeting-follow-up-kit",
      version: process.env.npm_package_version ?? "0.1.0",
      environment: environment.APP_ENV,
      revision: environment.GIT_COMMIT_SHA ?? process.env.K_REVISION ?? "local",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
